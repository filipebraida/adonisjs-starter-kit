import { BaseModelDto } from '@adocasts.com/dto/base'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class TokenDto extends BaseModelDto {
  declare id: string
  declare name: string | null
  declare lastUsedAt: string | null
  declare expiresAt: string | null
  declare createdAt: string

  constructor(token?: AccessToken) {
    super()

    if (!token) return

    this.id = String(token.identifier)
    this.name = token.name
    this.lastUsedAt = token.lastUsedAt ? token.lastUsedAt.toISOString() : null
    this.expiresAt = token.expiresAt ? token.expiresAt.toISOString() : null
    this.createdAt = token.createdAt.toISOString()
  }
}
