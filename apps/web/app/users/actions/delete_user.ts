import type User from '#auth/models/user'

export interface DeleteUserInput {
  target: User
}

/** Deletes a user; their role assignments and reset tokens go with them. */
export default class DeleteUser {
  async handle(input: DeleteUserInput): Promise<void> {
    await input.target.delete()
  }
}
