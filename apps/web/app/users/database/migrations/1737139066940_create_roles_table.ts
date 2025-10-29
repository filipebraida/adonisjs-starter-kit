import { BaseSchema } from '@adonisjs/lucid/schema'
import Roles from '#users/enums/role'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.string('description', 255).nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.defer(async (db) => {
      await db.table(this.tableName).insert([
        {
          id: Roles.USER,
          name: 'User',
          description: 'Authenticated User',
        },
        {
          id: Roles.ADMIN,
          name: 'Admin',
          description: 'Super User with full access',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
