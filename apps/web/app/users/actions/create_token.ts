import User from '#users/models/user'

export interface CreateTokenInput {
  owner: User
  name?: string
}

export interface CreatedToken {
  type: string
  token: string
}

export default class CreateToken {
  async handle(input: CreateTokenInput): Promise<CreatedToken> {
    const token = await User.accessTokens.create(input.owner, undefined, {
      name: input.name ?? 'Secret Token',
    })

    return {
      type: token.type,
      token: token.value!.release(),
    }
  }
}
