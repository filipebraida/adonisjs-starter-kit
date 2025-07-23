import { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import User from '#users/models/user'

import { signInValidator } from '#auth/validators'
import limiter from '@adonisjs/limiter/services/main'
import { Limiter } from '@adonisjs/limiter'

export default class SignInController {
  loginLimiter: Limiter
  constructor() {
    this.loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_in')
  }

  async handle({ auth, request, response, session, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    const key = `login_${request.ip()}_${email}`

    const [errors, user] = await this.loginLimiter.penalize(key, () => {
      return User.verifyCredentials(email, password)
    })
    if (errors) {
      session.flashErrors({
        E_TOO_MANY_REQUESTS: i18n.t('errors.E_TOO_MANY_REQUESTS'),
      })
      return response.redirect().toRoute('auth.sign_in.show')
    }
    await auth.use('web').login(user)

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
