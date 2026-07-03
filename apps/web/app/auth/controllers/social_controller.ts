import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import AuthenticateWithSocial from '#auth/actions/authenticate_with_social'

export default class SocialController {
  async redirect({ ally, params }: HttpContext) {
    return ally.use(params.provider).redirect()
  }

  async callback({ ally, auth, params, response, session }: HttpContext) {
    const social = ally.use(params.provider)

    if (social.accessDenied()) {
      session.flash('error', 'auth.social.error.access_denied')
      return response.redirect().toRoute('auth.sign_up.show')
    }

    if (social.stateMisMatch()) {
      session.flash('error', 'auth.social.error.state_mismatch')
      return response.redirect().toRoute('auth.sign_up.show')
    }

    if (social.hasError()) {
      session.flash('error', 'auth.social.error.uknown')
      return response.redirect().toRoute('auth.sign_up.show')
    }

    const socialUser = await social.user()

    await new AuthenticateWithSocial().handle({
      socialUser: {
        email: socialUser.email,
        name: socialUser.name,
        avatarUrl: socialUser.avatarUrl,
      },
      auth,
    })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
