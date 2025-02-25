import { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import User from '#users/models/user'

import { signInValidator } from '#auth/validators'

export default class SignInController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_in')
  }

  async handle({ auth, request, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      await auth.use('web').login(user)
    } catch (error) {
      session.flash('errors', 'The provided username/email or password is incorrect')

      return response.redirect().toRoute('auth.sign_in.show')
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
