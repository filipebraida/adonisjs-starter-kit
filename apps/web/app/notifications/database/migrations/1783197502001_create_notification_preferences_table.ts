import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.text('user_id').notNullable()
      table.text('tenant_id').nullable()
      table.text('notification_name').nullable()
      table.json('channels').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id'])
      table.index(['tenant_id'])
      table.unique(['user_id', 'tenant_id', 'notification_name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
