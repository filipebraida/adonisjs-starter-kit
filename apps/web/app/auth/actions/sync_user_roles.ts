import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

import { AuthzService } from '@adonis-agora/authz'

import Authorizer from '#core/authz/authorizer'

import AdminLockoutException from '#auth/exceptions/admin_lockout_exception'
import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import RoleNotFoundException from '#auth/exceptions/role_not_found_exception'
import { roleExists } from '#auth/queries/roles_query'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { ROLES } from '#auth/enums/role'
import type User from '#auth/models/user'

/**
 * Requires the executor to hold `users.manage_roles`.
 * @throws ManageRolesUnauthorizedException if they do not.
 */
export async function requireManageRoles(executor: User) {
  const authorizer = await app.container.make(Authorizer)
  const allowed = await authorizer.can(executor, CAPABILITIES_AUTH.usersManageRoles)
  if (!allowed) throw new ManageRolesUnauthorizedException()
}

/**
 * Requires `users.manage_roles` only when a role other than the default user
 * is granted. Defense in depth for create and invite: it holds even if the
 * validator accepted the role.
 * @throws ManageRolesUnauthorizedException if escalating without the capability.
 */
export async function requireManageRolesIfEscalating(executor: User, roles: string[]) {
  const escalating = roles.some((role) => role !== ROLES.USER)
  if (escalating) await requireManageRoles(executor)
}

/**
 * Requires the role to be assignable: defined in code or created on the roles
 * page. `assignRole` would otherwise create a role nobody configured.
 * @throws RoleNotFoundException if it is neither.
 */
export async function requireExistingRole(role: string) {
  if (!(await roleExists(role))) throw new RoleNotFoundException(role)
}

export interface SyncUserRolesInput {
  target: User
  desiredRoles: string[]
  executor: User
}

/**
 * Replaces a user's roles with the desired ones, in one transaction, and
 * audits the change. Removes before granting, so a failure halfway leaves less
 * privilege, never more.
 * @throws ManageRolesUnauthorizedException if the executor may not manage roles.
 * @throws AdminLockoutException if the executor would remove their own admin role.
 * @throws RoleNotFoundException if a desired role does not exist.
 */
export default class SyncUserRoles {
  async handle({ target, desiredRoles, executor }: SyncUserRolesInput): Promise<void> {
    await requireManageRoles(executor)
    for (const role of desiredRoles) await requireExistingRole(role)

    const current = await target.getRoles()

    const removingOwnAdmin =
      target.id === executor.id &&
      current.includes(ROLES.ADMIN) &&
      !desiredRoles.includes(ROLES.ADMIN)
    if (removingOwnAdmin) throw new AdminLockoutException()

    const changed =
      current.length !== desiredRoles.length || current.some((role) => !desiredRoles.includes(role))
    if (!changed) return

    const service = await app.container.make(AuthzService)
    const ref = service.refOf(target)!

    await db.transaction(async (trx) => {
      const store = service.store.withClient(trx)
      // Remove before granting: a failure halfway leaves less privilege, never more.
      for (const role of current) {
        if (!desiredRoles.includes(role)) await store.removeRole(ref, role)
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
