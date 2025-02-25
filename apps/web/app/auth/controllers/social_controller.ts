import type { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import User from '#users/models/user'

export default class SocialController {
  async redirect({ ally, params }: HttpContext) {
    const driverInstance = ally.use(params.provider)

    return driverInstance.redirect()
  }

  async callback({ ally, auth, params, response, session }: HttpContext) {
    const social = ally.use(params.provider)

    /**
     * User has denied access by canceling
     * the login flow
     */
    if (social.accessDenied()) {
      session.flash('errors', 'auth.social.error.access_denied')

      return response.redirect().toRoute('auth.sign_up.show')
    }

    /**
     * OAuth state verification failed. This happens when the
     * CSRF cookie gets expired.
     */
    if (social.stateMisMatch()) {
      session.flash('errors', 'auth.social.error.state_mismatch')

      return response.redirect().toRoute('auth.sign_up.show')
    }

    /**
     * Provider responded with some error
     */
    if (social.hasError()) {
      session.flash('errors', 'auth.social.error.uknown')

      return response.redirect().toRoute('auth.sign_up.show')
    }

    /**
     * Access user info
     */
    const socialUser = await social.user()

    let user = await User.findBy('email', socialUser.email)

    if (!user) {
      user = await User.create({
        fullName: socialUser.name,
        email: socialUser.email,
        password: null,
        avatarUrl: socialUser.avatarUrl,
      })
    }

    await auth.use('web').login(user)

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
