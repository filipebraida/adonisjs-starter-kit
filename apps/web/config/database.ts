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
        paths: ['app/users/database/migrations', 'app/notifications/database/migrations'],
      },
      seeders: {
        paths: ['app/users/database/seeders'],
      },
      schemaGeneration: {
        outputPath: './app/core/database/schema.ts',
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
