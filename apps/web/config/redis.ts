import { defineConfig } from '@adonisjs/redis'
import { type InferConnections } from '@adonisjs/redis/types'

import env from '#start/env'

/**
 * The Redis the durable workflows (the `bullmq` transport and the control
 * plane) and Transmit share: it is what lets the app run on more than one node.
 */
const redisConfig = defineConfig({
  connection: 'main',

  connections: {
    main: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: '',
      // BullMQ requires `null`: a blocking command must not give up halfway.
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
