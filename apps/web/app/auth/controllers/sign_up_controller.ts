import type { HttpContext } from '@adonisjs/core/http'
import { type Limiter } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'

import { afterAuthRedirectRoute } from '#config/auth'

import SignUp from '#auth/actions/sign_up'
import { signUpValidator } from '#auth/validators/auth'

import { setUserLocaleCookie } from '#core/utils/user_locale'

/**
 * The sign up form and its submit, which signs the new user in.
 * Public: the visitor has no account yet. Ten attempts per IP a minute: a
 * classroom behind one NAT shares the key, so the limit is generous and short.
 */
export default class SignUpController {
  static readonly public = true

  private signUpLimiter: Limiter

  constructor() {
    this.signUpLimiter = limiter.use({ requests: 10, duration: '1 min' })
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up', {})
  }

  async store({ auth, i18n, request, response, session }: HttpContext) {
    const user = await this.signUpLimiter.attempt(`sign_up_${request.ip()}`, async () => {
      const payload = await request.validateUsing(signUpValidator)
      return new SignUp().handle({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        locale: i18n.locale,
      })
    })

    if (!user) {
      session.flash('error', i18n.t('errors.E_TOO_MANY_REQUESTS'))
      return response.redirect().toRoute('auth.sign_up.show')
    }

    await auth.use('web').login(user)

    if (user.locale) {
      setUserLocaleCookie(response, user.locale)
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
