import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import User from '#auth/models/user'

export interface CreateTokenInput {
  owner: User
  name?: string
}

export interface CreatedToken {
  type: string
  token: string
}

/**
 * Creates an API token for its owner and audits it. The secret is returned
 * here once and never stored in clear.
 */
export default class CreateToken {
  async handle(input: CreateTokenInput): Promise<CreatedToken> {
    const token = await User.accessTokens.create(input.owner, undefined, {
      name: input.name ?? 'Secret Token',
    })

    await input.owner.auditCustom(AUDIT_EVENTS.TOKEN_CREATED, {
      new: { tokenId: String(token.identifier), name: token.name },
    })

    return {
      type: token.type,
      token: token.value!.release(),
    }
  }
}
