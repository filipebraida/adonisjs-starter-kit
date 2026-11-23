import { DiskSpaceCheck, HealthChecks, MemoryHeapCheck } from '@adonisjs/core/health'
import { DbCheck } from '@adonisjs/lucid/database'
import db from '@adonisjs/lucid/services/db'
import { RedisCheck } from '@adonisjs/redis'
import redis from '@adonisjs/redis/services/main'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck().cacheFor('1 hour'),
  new MemoryHeapCheck(),
  new DbCheck(db.connection()),
  new RedisCheck(redis.connection()),
])
