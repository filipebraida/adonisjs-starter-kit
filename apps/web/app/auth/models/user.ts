import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { beforeSave, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { authzRolesRelation } from '@adonis-agora/authz'
import { Auditable } from '@filipebraida/adonis-auditing'
import { hasPermissions } from '@adonis-agora/authz/mixins'
import { attachment, type AttachmentRelation } from '@jrmc/adonis-attachment/lucid'

import BaseModel from '#core/models/base_model'

import { AUDITABLE_TYPES } from '#auth/enums/auditable_type'
import AuthzRole from '#auth/models/authz_role'
import ResetPasswordToken from '#auth/models/reset_password_token'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder, hasPermissions(), Auditable) {
  static auditableName = AUDITABLE_TYPES.USER
  static auditMask = ['password']
  // The avatar JSON and its derived URL change with every upload; the upload itself is not a security event.
  static auditExclude = ['avatarUrl']

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

  @attachment<User>({ folder: 'avatars', variants: ['thumbnail'], meta: false })
  declare avatar: AttachmentRelation

  /** The picture a social login brought, used while no picture was uploaded. */
  @column()
  declare avatarUrl: string | null

  /** The uploaded picture's thumbnail URL, set by `preComputeUrls` before a screen reads it. */
  avatarThumbnailUrl: string | null = null

  /** Read-only view of the authz role assignments, for preload and `whereHas`. */
  @manyToMany(() => AuthzRole, authzRolesRelation())
  declare roles: ManyToMany<typeof AuthzRole>

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
   * personal channel (`notifications/users/<id>`).
   */
  notificationTargets() {
    return {
      database: { notifiableId: String(this.id) },
      transmit: { channel: `notifications/users/${this.id}` },
    }
  }

  static async preComputeUrls(models: User | User[]) {
    if (Array.isArray(models)) {
      await Promise.all(models.map((model) => this.preComputeUrls(model)))
      return
    }

    // The original stands in while the thumbnail is still being made.
    models.avatarThumbnailUrl = await models.avatar.getUrl('thumbnail', { fallback: 'original' })
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
