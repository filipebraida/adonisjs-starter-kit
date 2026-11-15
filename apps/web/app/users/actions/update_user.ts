import SyncUserRoles, {
  requireExistingRole,
  requireManageRoles,
} from '#auth/actions/sync_user_roles'
import type User from '#auth/models/user'

export interface UpdateUserInput {
  target: User
  fullName: string
  email: string
  role: string
  password?: string
  executor: User
}

/**
 * Updates a user on behalf of an admin, then syncs the role. A missing
 * password keeps the current one. A role change is authorized before anything
 * is written, so a refused change saves nothing.
 * @throws ManageRolesUnauthorizedException if the executor may not manage roles.
 * @throws AdminLockoutException if the executor would remove their own admin role.
 * @throws RoleNotFoundException if the new role does not exist.
 */
export default class UpdateUser {
  async handle(input: UpdateUserInput): Promise<User> {
    const current = await input.target.getRoles()
    const changingRole = current.length !== 1 || current[0] !== input.role
    if (changingRole) {
      await requireManageRoles(input.executor)
      await requireExistingRole(input.role)
    }

    input.target.merge({
      fullName: input.fullName,
      email: input.email,
      password: input.password ?? input.target.password,
    })
    await input.target.save()

    if (changingRole) {
      await new SyncUserRoles().handle({
        target: input.target,
        desiredRoles: [input.role],
        executor: input.executor,
      })
    }

    return input.target
  }
}
