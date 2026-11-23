import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonis-agora/durable/dashboard'

import Authorizer from '#core/authz/authorizer'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'

/** Where the console of the durable workflows is served. The admin menu links here. */
export const WORKFLOWS_CONSOLE_PATH = '/workflows'

/**
 * The console of the durable workflows: every run, what failed and what is
 * stuck. It also retries and cancels runs, so only `workflows.view` gets in,
 * through the app's own session. A guest is sent to the login; a signed-in
 * user without the capability gets a `403`.
 */
export default defineConfig({
  path: WORKFLOWS_CONSOLE_PATH,
  authorize: async (ctx) => {
    const guard = ctx.auth.use('web')
    if (!(await guard.check())) return { redirectTo: '/login' }

    const authorizer = await app.container.make(Authorizer)
    const allowed = await authorizer.can(guard.user, CAPABILITIES_AUTH.workflowsView)
    return allowed ? { allowed: true } : { allowed: false, reason: 'forbidden' }
  },
})
