import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import StopImpersonation from '#users/actions/stop_impersonation'
import ImpersonatePolicy from '#users/policies/impersonate_policy'
import { currentImpersonation } from '#auth/enums/impersonation'

/** Switches back to the admin behind the impersonation, from the banner. */
export default class StopImpersonationController {
  async handle({ bouncer, session, response, auth }: HttpContext) {
    await bouncer
      .with(ImpersonatePolicy)
      .authorize('stop', currentImpersonation(session, auth.user?.id))

    const admin = await new StopImpersonation().handle({ session, auth })
    if (!admin) return response.redirect().toRoute(afterAuthRedirectRoute)

    return response.redirect().toRoute('users.index')
  }
}
