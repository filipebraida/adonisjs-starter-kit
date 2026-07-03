import User from '#users/models/user'

export interface ListUserTokensInput {
  owner: User
}

export default class ListUserTokens {
  async handle(input: ListUserTokensInput) {
    return User.accessTokens.all(input.owner)
  }
}
