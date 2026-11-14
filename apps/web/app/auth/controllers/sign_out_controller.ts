import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthLogoutRedirectRoute } from '#config/auth'

/**
 * Signs the current user out. Public: signing out a guest is a no-op.
 */
export default class SignOutController {
  static readonly public = true

  async handle({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect().toRoute(afterAuthLogoutRedirectRoute)
  }
}
