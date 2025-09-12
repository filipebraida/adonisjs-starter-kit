import { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import { returnToKey } from '#auth/middleware/auth_middleware'

import User from '#users/models/user'

import { signInValidator } from '#auth/validators'

export function isSafeInternalPath(path?: string | null): path is string {
  if (!path) return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\')) return false

  return true
}

export default class SignInController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_in')
  }

  async handle({ auth, request, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(signInValidator)

    const returnTo = session.pull(returnToKey, null)

    session.regenerate()

    try {
      const user = await User.verifyCredentials(email, password)

      await auth.use('web').login(user)
    } catch (error) {
      session.flash('errors', 'The provided username/email or password is incorrect')

      return response.redirect().toRoute('auth.sign_in.show')
    }

    const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : null

    if (safeReturnTo) {
      return response.redirect().toPath(safeReturnTo)
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
