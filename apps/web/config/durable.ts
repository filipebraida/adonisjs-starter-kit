import app from '@adonisjs/core/services/app'
import { defineConfig, stores, transports } from '@adonis-agora/durable'

import { moduleDirs } from '#core/utils/module_dirs'

// The runs that carry a mail's secrets (a password reset token, an invite
// link): kept only long enough to read a failure.
const MAIL_WORKFLOWS = ['auth.send-password-reset', 'users.send-welcome']

export default defineConfig({
  // Runs, checkpoints and the transport's rows live in Postgres: no Redis.
  transport: 'db',
  transports: {
    db: transports.db({ autoCreate: false }),
  },

  store: 'lucid',
  stores: {
    lucid: stores.lucid(),
  },

  // The tables come from core's create_durable_tables migration.
  autoSchema: false,

  // Workflows live in their module's workflows/ folder, found on their own
  // here and in the workflowsHook of adonisrc.ts.
  workflowsPath: moduleDirs(app.makePath(), 'workflows'),
  stepsPath: false,

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
