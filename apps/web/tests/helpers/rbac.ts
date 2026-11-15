import { UserFactory } from '#auth/database/factories/user'
import type { Role } from '#auth/enums/role'
import User from '#auth/models/user'

/**
 * Assigns a role in authz. What the role grants comes from `roleGrants` in
 * config/capabilities.ts, resolved from code at check time, so there is no
 * catalog to seed; the assignment row is rolled back with the test's global
 * transaction.
 */
export async function withRole(user: User, role: string): Promise<void> {
  await user.assignRole(role)
}

// Idempotent: reuses the row if a prior run left it behind, overwrites password + role.
export async function ensureUser(input: {
  email: string
  password: string
  fullName?: string
  role?: Role
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
