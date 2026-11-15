import db from '@adonisjs/lucid/services/db'

import { AUTHZ_TABLES } from '@adonis-agora/authz'
import authz from '@adonis-agora/authz/services/main'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { isStructuralRole } from '#auth/enums/role'
import RoleNotFoundException from '#auth/exceptions/role_not_found_exception'
import StructuralRoleException from '#auth/exceptions/structural_role_exception'
import UnknownCapabilityException from '#auth/exceptions/unknown_capability_exception'
import type User from '#auth/models/user'
import { capabilityVocabulary } from '#auth/queries/roles_query'

export interface UpdateRoleCapabilitiesInput {
  role: string
  capabilities: string[]
  executor: User
}

/**
 * Sets an institutional role's capabilities to exactly the given list, with
 * its audit row, in one transaction: what is not listed is revoked.
 * @throws StructuralRoleException if the role is defined in code.
 * @throws UnknownCapabilityException if a capability is outside the vocabulary.
 * @throws RoleNotFoundException if the role was never created.
 */
export default class UpdateRoleCapabilities {
  async handle({ role, capabilities, executor }: UpdateRoleCapabilitiesInput): Promise<void> {
    if (isStructuralRole(role)) throw new StructuralRoleException()

    const vocabulary = capabilityVocabulary()
    const unknown = capabilities.find((capability) => !vocabulary.includes(capability))
    if (unknown) throw new UnknownCapabilityException(unknown)

    await db.transaction(async (trx) => {
      // Two saves of the same role would read the same state and store the
      // union of both diffs; locking the role's row serializes them.
      const row = await trx.from(AUTHZ_TABLES.roles).where('name', role).forUpdate().first()
      // `givePermissionToRole` would create a missing role: refuse instead.
      if (!row) throw new RoleNotFoundException(role)

      const store = authz.store.withClient(trx)
      const current = await store.getRolePermissions(role)

      for (const capability of current) {
        if (!capabilities.includes(capability))
          await store.revokePermissionFromRole(role, capability)
      }
      for (const capability of capabilities) {
        if (!current.includes(capability)) await store.givePermissionToRole(role, capability)
      }

      await executor.useTransaction(trx).auditCustom(AUDIT_EVENTS.ROLE_CAPABILITIES_CHANGED, {
        old: { capabilities: [...current].sort() },
        new: { capabilities: [...capabilities].sort() },
        metadata: { role },
      })
    })
  }
}
