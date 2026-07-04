import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.text('notifiable_id').notNullable()
      table.text('tenant_id').nullable()
      table.text('type').notNullable()
      table.jsonb('content').notNullable()
      table.text('status').notNullable().defaultTo('unseen')
      table.jsonb('tags').nullable()
      table.timestamp('read_at').nullable()
      table.timestamp('seen_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['notifiable_id'])
      table.index(['tenant_id'])
      table.index(['status'])
      table.index(['notifiable_id', 'tenant_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
