import { BaseTransformer } from '@adonisjs/core/transformers'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

export default class TokenTransformer extends BaseTransformer<AccessToken> {
  toObject() {
    const token = this.resource

    return {
      id: String(token.identifier),
      name: token.name,
      lastUsedAt: token.lastUsedAt ? token.lastUsedAt.toISOString() : null,
      expiresAt: token.expiresAt ? token.expiresAt.toISOString() : null,
      createdAt: token.createdAt.toISOString(),
    }
  }
}
