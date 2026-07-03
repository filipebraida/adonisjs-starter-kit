import { randomUUID } from 'node:crypto'

import { requireManageRolesIfEscalating } from '#users/actions/sync_user_roles'
import type { Role as RoleSlug } from '#users/enums/role'
import Role from '#users/models/role'
import User from '#users/models/user'

export interface CreateUserInput {
  fullName: string
  email: string
  role: RoleSlug
  password?: string
  executor: User
}

export default class CreateUser {
  async handle(input: CreateUserInput): Promise<User> {
    await requireManageRolesIfEscalating(input.executor, [input.role])

    const user = new User()
    user.merge({
      fullName: input.fullName,
      email: input.email,
      password: input.password ?? randomUUID(),
    })
    await user.save()

    const role = await Role.findByOrFail('name', input.role)
    await user.assignRole(role)

    return user
  }
}
