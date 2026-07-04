import type { HttpContext } from '@adonisjs/core/http'
import { type Limiter } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'

import { afterAuthRedirectRoute } from '#config/auth'

import SignIn from '#auth/actions/sign_in'
import { returnToKey } from '#auth/middleware/auth_middleware'
import { signInValidator } from '#auth/validators/auth'

import { setUserLocaleCookie } from '#common/services/user_locale'

export function isSafeInternalPath(path?: string | null): path is string {
  if (!path) return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\')) return false

  return true
}

export default class SignInController {
  private loginLimiter: Limiter

  constructor() {
    this.loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_in', {})
  }

  async handle({ auth, request, response, session, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    const returnTo = session.pull(returnToKey, null)
    const key = `login_${request.ip()}_${email}`

    const [errors, user] = await this.loginLimiter.penalize(key, async () => {
      return new SignIn().handle({ email, password, auth, session })
    })

    if (errors) {
      session.flash('error', i18n.t('errors.E_TOO_MANY_REQUESTS'))
      return response.redirect().toRoute('auth.sign_in.show')
    }

    if (user.locale) {
      setUserLocaleCookie(response, user.locale)
    }

    const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : null
    if (safeReturnTo) return response.redirect().toPath(safeReturnTo)

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
