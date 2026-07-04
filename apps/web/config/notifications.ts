import { channels, defineConfig } from '@facteurjs/adonisjs'
import { databases } from '@facteurjs/adonisjs/database'
import type { InferChannels } from '@facteurjs/adonisjs/types'

const config = defineConfig({
  databaseAdapter: databases.lucid({ connectionName: 'postgres' }),
  channels: {
    database: channels.database({ connectionName: 'postgres' }),
    transmit: channels.transmit(),
  },
})

export default config

declare module '@facteurjs/adonisjs/types' {
  interface NotificationChannels extends InferChannels<typeof config> {}
}
