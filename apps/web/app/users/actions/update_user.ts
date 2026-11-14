import SyncUserRoles from '#auth/actions/sync_user_roles'
import type { Role as RoleSlug } from '#auth/enums/role'
import type User from '#auth/models/user'

export interface UpdateUserInput {
  target: User
  fullName: string
  email: string
  role: RoleSlug
  password?: string
  executor: User
}

/**
 * Updates a user on behalf of an admin, then syncs the role. A missing
 * password keeps the current one.
 * @throws ManageRolesUnauthorizedException if the executor may not manage roles.
 * @throws AdminLockoutException if the executor would remove their own admin role.
 */
export default class UpdateUser {
  async handle(input: UpdateUserInput): Promise<User> {
    input.target.merge({
      fullName: input.fullName,
      email: input.email,
      password: input.password ?? input.target.password,
    })
    await input.target.save()

    await new SyncUserRoles().handle({
      target: input.target,
      desiredRoles: [input.role],
      executor: input.executor,
    })

    return input.target
  }
}
