import User from '#users/models/user'

export interface DeleteTokenInput {
  owner: User
  tokenId: string
}

export default class DeleteToken {
  async handle(input: DeleteTokenInput): Promise<void> {
    await User.accessTokens.delete(input.owner, input.tokenId)
  }
}
