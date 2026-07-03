import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import SignUp from '#auth/actions/sign_up'
import { signUpValidator } from '#auth/validators'

export default class SignUpController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up', {})
  }

  async handle({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(signUpValidator)

    await new SignUp().handle({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      auth,
    })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
