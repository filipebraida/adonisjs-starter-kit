import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

import { AuthzService } from '@adonis-agora/authz'

import Authorizer from '#core/authz/authorizer'

import AdminLockoutException from '#auth/exceptions/admin_lockout_exception'
import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { ROLES, type Role } from '#auth/enums/role'
import type User from '#auth/models/user'

export async function requireManageRoles(executor: User) {
  const authorizer = await app.container.make(Authorizer)
  const allowed = await authorizer.can(executor, CAPABILITIES_AUTH.usersManageRoles)
  if (!allowed) throw new ManageRolesUnauthorizedException()
}

// Defense-in-depth for create/invite: enforce manage-roles even if the
// validator accepted a non-default role.
export async function requireManageRolesIfEscalating(executor: User, roles: string[]) {
  const escalating = roles.some((role) => role !== ROLES.USER)
  if (escalating) await requireManageRoles(executor)
}

export interface SyncUserRolesInput {
  target: User
  desiredRoles: Role[]
  executor: User
}

export default class SyncUserRoles {
  async handle({ target, desiredRoles, executor }: SyncUserRolesInput): Promise<void> {
    await requireManageRoles(executor)

    const current = await target.getRoles()

    const removingOwnAdmin =
      target.id === executor.id &&
      current.includes(ROLES.ADMIN) &&
      !desiredRoles.includes(ROLES.ADMIN)
    if (removingOwnAdmin) throw new AdminLockoutException()

    const changed =
      current.length !== desiredRoles.length ||
      current.some((role) => !desiredRoles.includes(role as Role))
    if (!changed) return

    const service = await app.container.make(AuthzService)
    const ref = service.refOf(target)!

    await db.transaction(async (trx) => {
      const store = service.store.withClient(trx)
      // Remove before granting: a failure halfway leaves less privilege, never more.
      for (const role of current) {
        if (!desiredRoles.includes(role as Role)) await store.removeRole(ref, role)
      }
      for (const role of desiredRoles) {
        if (!current.includes(role)) await store.assignRole(ref, role)
      }

      // The assignments live in authz tables, outside any auditable model: record them here.
      await target.useTransaction(trx).auditCustom(AUDIT_EVENTS.ROLES_SYNCED, {
        old: { roles: [...current].sort() },
        new: { roles: [...desiredRoles].sort() },
        metadata: { executorId: executor.id },
      })
    })
  }
}
