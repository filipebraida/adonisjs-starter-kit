import db from '@adonisjs/lucid/services/db'

import authz from '@adonis-agora/authz/services/main'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { isStructuralRole } from '#auth/enums/role'
import RoleHasMembersException from '#auth/exceptions/role_has_members_exception'
import RoleNotFoundException from '#auth/exceptions/role_not_found_exception'
import StructuralRoleException from '#auth/exceptions/structural_role_exception'
import type User from '#auth/models/user'

export interface DeleteRoleInput {
  role: string
  executor: User
}

/**
 * Deletes an institutional role nobody holds, with its capabilities. With
 * members it refuses: taking the role from each user is a decision of its own.
 * @throws StructuralRoleException if the role is defined in code.
 * @throws RoleHasMembersException if a user still holds it.
 * @throws RoleNotFoundException if the role was never created.
 */
export default class DeleteRole {
  async handle({ role, executor }: DeleteRoleInput): Promise<void> {
    if (isStructuralRole(role)) throw new StructuralRoleException()

    // Counting and deleting in one transaction: an assignment in between cannot slip through.
    await db.transaction(async (trx) => {
      const store = authz.store.withClient(trx)

      const members = await store.countSubjectsForRole(role)
      if (members > 0) throw new RoleHasMembersException(members)

      const capabilities = await store.getRolePermissions(role)
      if (!(await store.deleteRole(role))) throw new RoleNotFoundException(role)

      await executor.useTransaction(trx).auditCustom(AUDIT_EVENTS.ROLE_DELETED, {
        old: { capabilities: [...capabilities].sort() },
        metadata: { role },
      })
    })
  }
}
