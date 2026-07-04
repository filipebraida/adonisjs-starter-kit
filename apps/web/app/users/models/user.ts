import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { attachment, attachmentManager } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'

import BaseModel from '#common/models/base_model'

import { withRoles } from '#users/mixins/with_roles'
import ResetPasswordToken from '#users/models/reset_password_token'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder, withRoles()) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare locale: string | null

  @attachment({ preComputeUrl: false, variants: ['thumbnail'] })
  declare avatar: Attachment

  @column()
  declare avatarUrl: string | null

  @hasMany(() => ResetPasswordToken)
  declare resetPasswordTokens: HasMany<typeof ResetPasswordToken>

  @beforeSave()
  static async normalizeEmail(user: User) {
    if (user.$dirty.email && typeof user.email === 'string') {
      user.email = user.email.trim().toLowerCase()
    }
  }

  /**
   * Delivery targets used by facteur per channel. `database` persists
   * the notification row; `transmit` pushes the SSE event on the user's
   * personal channel (`notifications/user-<id>`).
   */
  notificationTargets() {
    return {
      database: { notifiableId: String(this.id) },
      transmit: { channel: `notifications/user-${this.id}` },
    }
  }

  static async preComputeUrls(models: User | User[]) {
    if (Array.isArray(models)) {
      await Promise.all(models.map((model) => this.preComputeUrls(model)))
      return
    }

    if (!models.avatar) {
      return
    }

    const thumbnail = models.avatar.getVariant('thumbnail')

    if (thumbnail) {
      await attachmentManager.computeUrl(thumbnail)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
