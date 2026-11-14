import { BaseSchema } from '@adonisjs/lucid/schema'

import { AUTHZ_TABLES, createAuthzTables, dropAuthzTables } from '@adonis-agora/authz'

/**
 * The RBAC tables of @adonis-agora/authz. The DDL is the library's own (the
 * same functions its Lucid store would run), so the migration cannot drift
 * from it; config/authz.ts turns `autoCreateSchema` off so this is the only
 * path that creates them.
 *
 * The foreign keys are ours. The library leaves them out because its pivots
 * are polymorphic; here the only subject is `users`, so `subject_id` follows
 * the user away, and a role or permission cannot be dropped while granted.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await createAuthzTables(db, { subjectIdType: 'integer' })

      await db.schema.alterTable(AUTHZ_TABLES.subjectRole, (table) => {
        table.foreign('subject_id').references('users.id').onDelete('CASCADE')
        table.foreign('role_id').references(`${AUTHZ_TABLES.roles}.id`).onDelete('RESTRICT')
      })
      await db.schema.alterTable(AUTHZ_TABLES.subjectPermission, (table) => {
        table.foreign('subject_id').references('users.id').onDelete('CASCADE')
        table
          .foreign('permission_id')
          .references(`${AUTHZ_TABLES.permissions}.id`)
          .onDelete('RESTRICT')
      })
      await db.schema.alterTable(AUTHZ_TABLES.rolePermission, (table) => {
        table.foreign('role_id').references(`${AUTHZ_TABLES.roles}.id`).onDelete('RESTRICT')
        table
          .foreign('permission_id')
          .references(`${AUTHZ_TABLES.permissions}.id`)
          .onDelete('RESTRICT')
      })
    })
  }

  async down() {
    this.defer((db) => dropAuthzTables(db))
  }
}
