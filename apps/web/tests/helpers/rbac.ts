import { ALL_PERMISSIONS, type Permission } from '#users/enums/permission'
import { ROLES, type Role as RoleSlug } from '#users/enums/role'
import Role from '#users/models/role'
import type User from '#users/models/user'

// Call after `wrapInGlobalTransaction` — otherwise the seeded rows leak.
export async function ensureBaseRoles(): Promise<void> {
  const admin = await Role.updateOrCreate({ name: ROLES.ADMIN }, { permissions: ALL_PERMISSIONS })
  await admin.syncPermissions(ALL_PERMISSIONS)
  await Role.updateOrCreate({ name: ROLES.USER }, { permissions: [] })
}

export async function withRole(user: User, roleName: RoleSlug): Promise<Role> {
  const role = await Role.firstOrCreate({ name: roleName }, { permissions: [] })
  await user.assignRole(role)
  return role
}

export async function withPermissions(
  user: User,
  roleName: string,
  permissions: Permission[]
): Promise<Role> {
  const role = await Role.firstOrCreate({ name: roleName }, { permissions })
  await role.syncPermissions(permissions)
  await user.assignRole(role)
  return role
}
