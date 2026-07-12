import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import AuthenticateWithSocial from '#auth/actions/authenticate_with_social'

import { setUserLocaleCookie } from '#common/services/user_locale'

export default class SocialController {
  async redirect({ ally, params }: HttpContext) {
    return ally.use(params.provider).redirect()
  }

  async callback({ ally, auth, i18n, params, response, session }: HttpContext) {
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

    const user = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: socialUser.email,
        name: socialUser.name,
        avatarUrl: socialUser.avatarUrl,
      },
      locale: i18n.locale,
    })

    await auth.use('web').login(user)

    if (user.locale) {
      setUserLocaleCookie(response, user.locale)
    }

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
