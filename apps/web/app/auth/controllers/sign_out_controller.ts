import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthLogoutRedirectRoute } from '#config/auth'

import { IMPERSONATION_SESSION_KEY } from '#auth/enums/impersonation'

/**
 * Signs the current user out. Public: signing out a guest is a no-op. Logout
 * keeps the rest of the session, so the impersonation mark is dropped too:
 * left behind, it would blame the admin for what the target does after
 * signing in on the same browser.
 */
export default class SignOutController {
  static readonly public = true

  async handle({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.forget(IMPERSONATION_SESSION_KEY)

    return response.redirect().toRoute(afterAuthLogoutRedirectRoute)
  }
}
