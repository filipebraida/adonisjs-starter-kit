import AdminLockoutException from '#users/exceptions/admin_lockout'
import ManageRolesUnauthorizedException from '#users/exceptions/manage_roles_unauthorized'
import { PERMISSIONS } from '#users/enums/permission'
import { ROLES, type Role as RoleSlug } from '#users/enums/role'
import Role from '#users/models/role'
import type User from '#users/models/user'

export async function requireManageRoles(executor: User) {
  const allowed = await executor.hasPermission(PERMISSIONS.usersManageRoles)
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
