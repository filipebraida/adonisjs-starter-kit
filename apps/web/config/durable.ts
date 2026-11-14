import app from '@adonisjs/core/services/app'
import { defineConfig, stores, transports } from '@adonis-agora/durable'

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

  // Workflows live in their module. List a module's folder here, and in the
  // workflowsHook of adonisrc.ts, when it gets its first workflow.
  workflowsPath: ['app/auth/workflows', 'app/users/workflows'],
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
