import app from '@adonisjs/core/services/app'
import { controlPlanes, defineConfig, stores, transports } from '@adonis-agora/durable'

import { moduleDirs } from '#core/utils/module_dirs'
import env from '#start/env'

// The runs that carry a mail's secrets (a password reset token, an invite
// link): kept only long enough to read a failure.
const MAIL_WORKFLOWS = ['auth.send-password-reset', 'users.send-welcome']

// The suite must not serve the dev server's steps or cancellations, nor the reverse.
const prefix = app.inTest ? 'durable-test' : 'durable'

export default defineConfig({
  // Runs and checkpoints live in Postgres; dispatched steps go through a Redis
  // queue, the same Redis that carries Transmit between nodes.
  transport: 'bullmq',
  transports: {
    bullmq: transports.bullmq({
      connection: {
        host: env.get('REDIS_HOST'),
        port: env.get('REDIS_PORT'),
        password: env.get('REDIS_PASSWORD') || undefined,
      },
      prefix,
    }),
  },

  // Cancellations and lifecycle events reach every instance.
  controlPlane: controlPlanes.redis({ connection: 'main', prefix }),

  store: 'lucid',
  stores: {
    lucid: stores.lucid(),
  },

  // The tables come from core's create_durable_tables migration.
  autoSchema: false,

  // Workflows and dispatched steps live in their module's workflows/ and
  // steps/ folders, found on their own here and in the hooks of adonisrc.ts.
  workflowsPath: moduleDirs(app.makePath(), 'workflows'),
  stepsPath: moduleDirs(app.makePath(), 'steps'),

  // The worker (timers, schedules, recovery) runs inside the web process, so
  // production stays one PM2 process.
  worker: { embedded: true },

  retention: {
    policies: [
      { statuses: ['completed'], maxAge: '1d', scope: { workflows: MAIL_WORKFLOWS } },
      {
        statuses: ['failed', 'cancelled', 'dead'],
        maxAge: '7d',
        scope: { workflows: MAIL_WORKFLOWS },
      },
    ],
  },

  // Only the web process consumes runs. Specs share one connection inside the
  // global transaction, which a polling consumer would query after the test
  // ended; an ace command only produces.
  consumers: app.getEnvironment() === 'web' ? 'auto' : 'never',
})
