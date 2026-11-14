import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { PostgreConfig } from '@adonisjs/lucid/types/database'

import { isPreparableTestDatabase } from '#core/utils/test_database'

const MAINTENANCE = 'test_maintenance'

/**
 * Gives the Japa suite its own, freshly migrated database (`DB_DATABASE` from
 * `.env.test`), so tests never read or write the dev data. Creates the
 * database when the Postgres server does not have it (an existing compose
 * volume or a CI service), then wipes and migrates it.
 *
 * Refuses outside `NODE_ENV=test` and for any database name without the
 * `_test` suffix: it wipes what it migrates.
 *
 * @example
 *   NODE_ENV=test node ace db:prepare-test
 */
export default class PrepareTestDatabase extends BaseCommand {
  static commandName = 'db:prepare-test'
  static description = 'Create, wipe and migrate the test database'
  static options: CommandOptions = { startApp: true }

  async run() {
    const db = await this.app.container.make('lucid.db')
    const config = db.getRawConnection(db.primaryConnectionName)!.config as PostgreConfig
    const connection = config.connection as { database: string }
    const database = connection.database

    if (!isPreparableTestDatabase(this.app.inTest, database)) {
      this.logger.error(
        `Refusing to prepare "${database}": run with NODE_ENV=test and a DB_DATABASE ending in "_test" (see .env.test).`
      )
      this.exitCode = 1
      return
    }

    // CREATE DATABASE has to run from another database; `postgres` always exists.
    db.manager.add(MAINTENANCE, { ...config, connection: { ...connection, database: 'postgres' } })
    try {
      const maintenance = db.connection(MAINTENANCE)
      const found = await maintenance.from('pg_database').where('datname', database).first()
      if (!found) {
        await maintenance.rawQuery('create database ??', [database])
        this.logger.info(`created database ${database}`)
      }
    } finally {
      await db.manager.close(MAINTENANCE, true)
    }

    for (const [command, args] of [
      ['db:wipe', []],
      ['migration:run', ['--compact-output', '--no-schema-generate']],
    ] as const) {
      const result = await this.kernel.exec(command, [...args])
      if (result.exitCode) {
        this.error = result.error
        this.exitCode = result.exitCode
        return
      }
    }
  }
}
