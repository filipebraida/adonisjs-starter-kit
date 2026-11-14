import string from '@adonisjs/core/helpers/string'

import { requireManageRolesIfEscalating } from '#auth/actions/sync_user_roles'
import type { Role as RoleSlug } from '#auth/enums/role'
import User from '#auth/models/user'

export interface CreateUserInput {
  fullName: string
  email: string
  role: RoleSlug
  password?: string
  executor: User
}

/**
 * Creates a user with a role on behalf of an admin. Without a password the
 * account gets an unguessable one, until a reset sets a real one.
 * @throws ManageRolesUnauthorizedException if granting a role above user without the capability.
 */
export default class CreateUser {
  async handle(input: CreateUserInput): Promise<User> {
    await requireManageRolesIfEscalating(input.executor, [input.role])

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
