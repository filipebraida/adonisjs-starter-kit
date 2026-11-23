import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import SignIn from '#auth/actions/sign_in'
import LoginLimiter from '#auth/services/login_limiter'
import { returnToKey } from '#auth/middleware/auth_middleware'
import { signInValidator } from '#auth/validators/auth'

import { setUserLocaleCookie } from '#core/utils/user_locale'

export function isSafeInternalPath(path?: string | null): path is string {
  if (!path) return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\')) return false

  return true
}

/**
 * The sign in form and its submit. Public: the visitor is not signed in yet.
 * Five failed attempts per IP and email lock the pair out for a minute, and a
 * success returns to the internal page the auth middleware remembered.
 */
export default class SignInController {
  static readonly public = true

  private loginLimiter = new LoginLimiter()

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_in', {})
  }

  async store({ auth, request, response, session, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    const returnTo = session.pull(returnToKey, null)
    const key = this.loginLimiter.key(request.ip(), email)

    const [errors, user] = await this.loginLimiter.limiter.penalize(key, async () => {
      return new SignIn().handle({ email, password })
    })

    if (errors) {
      session.flash('error', i18n.t('errors.E_TOO_MANY_REQUESTS'))
      return response.redirect().toRoute('auth.sign_in.show')
    }

    session.regenerate()
    await auth.use('web').login(user)

    if (user.locale) {
      setUserLocaleCookie(response, user.locale)
    }

    const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : null
    if (safeReturnTo) return response.redirect().toPath(safeReturnTo)

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
