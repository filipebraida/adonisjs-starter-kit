import { AUTHZ_TABLES } from '@adonis-agora/authz'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * A row of the authz roles table, read through `User.roles` so lists can
 * preload and filter by role. Writes go through the authz store
 * (`user.assignRole`, `SyncUserRoles`), never this model.
 */
export default class AuthzRole extends BaseModel {
  static table = AUTHZ_TABLES.roles

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string
}
