import { defineConfig } from '@adonisjs/transmit'
import { redis } from '@adonisjs/transmit/transports/redis'

import env from '#start/env'

// SSE goes through Redis: a browser stays on one node, and a notification sent
// from another node reaches it through Redis. In memory it would only reach
// the browsers on the same node.
export default defineConfig({
  pingInterval: false,
  transport: {
    driver: redis({
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD'),
      keyPrefix: 'transmit',
    }),
  },
})
