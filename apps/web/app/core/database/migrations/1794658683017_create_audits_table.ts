import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.text('user_type').nullable()
      table.text('user_id').nullable()
      table.text('event').notNullable()
      table.text('auditable_type').notNullable()
      table.bigInteger('auditable_id').notNullable()
      table.jsonb('old_values').nullable()
      table.jsonb('new_values').nullable()
      table.jsonb('tags').nullable()
      table.jsonb('metadata').nullable()
      table.text('tenant_id').nullable()
      table.text('audit_comment').nullable()
      table.text('request_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['auditable_type', 'auditable_id'], 'idx_audits_auditable')
      table.index(['user_type', 'user_id'], 'idx_audits_user')
      table.index('event', 'idx_audits_event')
      table.index('created_at', 'idx_audits_created_at')
      table.index('tenant_id', 'idx_audits_tenant')
      table.index('request_id', 'idx_audits_request')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
