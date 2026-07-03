import SyncUserRoles from '#users/actions/sync_user_roles'
import type { Role as RoleSlug } from '#users/enums/role'
import type User from '#users/models/user'

export interface UpdateUserInput {
  target: User
  fullName: string
  email: string
  role: RoleSlug
  password?: string
  executor: User
}

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
