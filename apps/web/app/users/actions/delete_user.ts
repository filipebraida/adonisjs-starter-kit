import type User from '#auth/models/user'

export interface DeleteUserInput {
  target: User
}

export default class DeleteUser {
  async handle(input: DeleteUserInput): Promise<void> {
    await input.target.delete()
  }
}
