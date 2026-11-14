import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  prettyPrintDebugQueries: app.inDev,
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: [
          'app/core/database/migrations',
          'app/auth/database/migrations',
          'app/notifications/database/migrations',
        ],
      },
      seeders: {
        paths: ['app/auth/database/seeders'],
      },
      schemaGeneration: {
        outputPath: './app/core/database/schema.ts',
        // Tables owned by libraries (authz, auditing, durable) that their own
        // stores read: no model of ours extends a generated schema for them.
        excludeTables: [
          'audits',
          'authz_permissions',
          'authz_role_permission',
          'authz_roles',
          'authz_subject_permission',
          'authz_subject_role',
          'durable_buffered_events',
          'durable_buffered_signals',
          'durable_run_attributes',
          'durable_schedules',
          'durable_schema_meta',
          'durable_signal_waiters',
          'durable_step_checkpoints',
          'durable_transport_control',
          'durable_transport_heartbeats',
          'durable_transport_messages',
          'durable_transport_results',
          'durable_transport_tasks',
          'durable_transport_worker_keys',
          'durable_workflow_runs',
        ],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
