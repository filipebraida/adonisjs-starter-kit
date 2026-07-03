import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthLogoutRedirectRoute } from '#config/auth'

export default class SignOutController {
  async handle({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect().toRoute(afterAuthLogoutRedirectRoute)
  }
}
