import AdminLockoutException from '#users/exceptions/admin_lockout'
import ManageRolesUnauthorizedException from '#users/exceptions/manage_roles_unauthorized'
import { PERMISSIONS } from '#users/enums/permission'
import { ROLES, type Role as RoleSlug } from '#users/enums/role'
import Role from '#users/models/role'
import type User from '#users/models/user'

/** Throws unless the executor holds the dedicated `users.manage_roles` permission. */
export async function requireManageRoles(executor: User) {
  const allowed = await executor.hasPermission(PERMISSIONS.usersManageRoles)
  if (!allowed) throw new ManageRolesUnauthorizedException()
}

/**
 * Defense-in-depth for create/invite: assigning any role beyond the default
 * `user` is an escalation and requires the manage-roles permission, even when
 * the validator already accepted the value.
 */
export async function requireManageRolesIfEscalating(executor: User, roles: string[]) {
  const escalating = roles.some((role) => role !== ROLES.USER)
  if (escalating) await requireManageRoles(executor)
}

export interface SyncUserRolesInput {
  target: User
  desiredRoles: RoleSlug[]
  executor: User
}

export default class SyncUserRoles {
  async handle({ target, desiredRoles, executor }: SyncUserRolesInput): Promise<void> {
    await requireManageRoles(executor)

    const currentNames = await target.getRoleNames()

    const removingOwnAdmin =
      target.id === executor.id &&
      currentNames.includes(ROLES.ADMIN) &&
      !desiredRoles.includes(ROLES.ADMIN)
    if (removingOwnAdmin) throw new AdminLockoutException()

    const roles = await Role.query().whereIn('name', desiredRoles)
    await target.syncRoles(roles)
  }
}
