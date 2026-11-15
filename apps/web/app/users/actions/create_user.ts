import string from '@adonisjs/core/helpers/string'

import { requireExistingRole, requireManageRolesIfEscalating } from '#auth/actions/sync_user_roles'
import User from '#auth/models/user'

export interface CreateUserInput {
  fullName: string
  email: string
  role: string
  password?: string
  executor: User
}

/**
 * Creates a user with a role on behalf of an admin. Without a password the
 * account gets an unguessable one, until a reset sets a real one.
 * @throws ManageRolesUnauthorizedException if granting a role above user without the capability.
 * @throws RoleNotFoundException if the role does not exist.
 */
export default class CreateUser {
  async handle(input: CreateUserInput): Promise<User> {
    await requireManageRolesIfEscalating(input.executor, [input.role])
    await requireExistingRole(input.role)

    const user = new User()
    user.merge({
      fullName: input.fullName,
      email: input.email,
      password: input.password ?? string.random(32),
    })
    await user.save()

    await user.assignRole(input.role)

    return user
  }
}
