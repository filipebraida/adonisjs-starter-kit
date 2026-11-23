import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'

import {
  createDurableRunListIndexes,
  createDurableTables,
  dropDurableRunListIndexes,
  dropDurableTables,
} from '@adonis-agora/durable'

/**
 * The tables of @adonis-agora/durable: the `lucid` store (runs, step
 * checkpoints, signals, schedules). Dispatched steps travel through Redis
 * (the `bullmq` transport), not a table. The DDL is the
 * library's own, and config/durable.ts turns `autoSchema` off, so this is the
 * only path that creates them.
 */
export default class extends BaseSchema {
  // The helpers check out their own connection from the pool, so they cannot
  // run inside the transaction the migrator would open.
  static disableTransactions = true

  async up() {
    await createDurableTables(db, this.db.connectionName)
    // The indexes the run list of the workflows console sorts and filters by.
    await createDurableRunListIndexes(db, this.db.connectionName)
  }

  async down() {
    await dropDurableRunListIndexes(db, this.db.connectionName)
    await dropDurableTables(db, this.db.connectionName)
  }
}
