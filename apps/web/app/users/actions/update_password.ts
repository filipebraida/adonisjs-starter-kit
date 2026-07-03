import type User from '#users/models/user'

export interface UpdatePasswordInput {
  target: User
  password: string
}

export default class UpdatePassword {
  async handle(input: UpdatePasswordInput): Promise<User> {
    input.target.password = input.password
    await input.target.save()
    return input.target
  }
}
