import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import User from '#auth/models/user'

export interface DeleteTokenInput {
  owner: User
  tokenId: string
}

export default class DeleteToken {
  async handle(input: DeleteTokenInput): Promise<void> {
    const deleted = await User.accessTokens.delete(input.owner, input.tokenId)
    if (deleted) {
      await input.owner.auditCustom(AUDIT_EVENTS.TOKEN_REVOKED, { old: { tokenId: input.tokenId } })
    }
  }
}
