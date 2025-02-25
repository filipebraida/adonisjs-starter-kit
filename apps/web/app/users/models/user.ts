import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo, column, computed } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import BaseModel from '#common/models/base_model'
import Role from '#users/models/role'

import Roles from '#users/enums/role'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare avatarUrl: string | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @computed()
  get isAdmin() {
    return this.roleId === Roles.ADMIN
  }
}
