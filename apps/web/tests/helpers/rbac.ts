import { UserFactory } from '#users/database/factories/user'
import { ALL_PERMISSIONS, type Permission } from '#users/enums/permission'
import { ROLES, type Role as RoleSlug } from '#users/enums/role'
import Role from '#users/models/role'
import User from '#users/models/user'

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

// Bypasses the WithRoles mixin's in-memory cache, which stays stale after syncRoles/assignRole.
export async function currentRoleNames(user: User): Promise<string[]> {
  const rows = await user.related('roles').query().select('name')
  return rows.map((row) => row.name)
}

// Idempotent: reuses the row if a prior run left it behind, overwrites password + role.
export async function ensureUser(input: {
  email: string
  password: string
  fullName?: string
  role?: RoleSlug
}): Promise<User> {
  const existing = await User.query().where('email', input.email).first()

  const user = existing
    ? await existing
        .merge({
          password: input.password,
          fullName: input.fullName ?? existing.fullName,
        })
        .save()
    : await UserFactory.merge({
        email: input.email,
        password: input.password,
        fullName: input.fullName,
      }).create()

  if (input.role) await withRole(user, input.role)

  return user
}
