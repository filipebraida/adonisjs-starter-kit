import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthLogoutRedirectRoute } from '#config/auth'

import SignOut from '#auth/actions/sign_out'

export default class SignOutController {
  async handle({ auth, response }: HttpContext) {
    await new SignOut().handle({ auth })

    return response.redirect().toRoute(afterAuthLogoutRedirectRoute)
  }
}
