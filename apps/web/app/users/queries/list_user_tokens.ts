import User from '#auth/models/user'

export interface ListUserTokensInput {
  owner: User
}

/** A user's API tokens, without their secrets. */
export default class ListUserTokens {
  async handle(input: ListUserTokensInput) {
    return User.accessTokens.all(input.owner)
  }
}
