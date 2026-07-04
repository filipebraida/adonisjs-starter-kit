import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import SignUp from '#auth/actions/sign_up'
import { signUpValidator } from '#auth/validators'

import { setUserLocaleCookie } from '#common/services/user_locale'

export default class SignUpController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up', {})
  }

  async handle({ auth, i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(signUpValidator)

    const user = await new SignUp().handle({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      locale: i18n.locale,
      auth,
    })

    if (user.locale) {
      setUserLocaleCookie(response, user.locale)
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
