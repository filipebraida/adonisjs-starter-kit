import type { HttpContext } from '@adonisjs/core/http'
import { type Limiter } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'

import RequestPasswordReset from '#auth/actions/request_password_reset'
import { forgotPasswordValidator } from '#auth/validators/auth'

/**
 * The forgot password form and its submit, which mails a reset link.
 * Public: the visitor has lost access to the account.
 */
export default class ForgotPasswordController {
  static readonly public = true

  // Each request may send a mail: one address cannot use the form to flood inboxes.
  private forgotPasswordLimiter: Limiter

  constructor() {
    this.forgotPasswordLimiter = limiter.use({ requests: 5, duration: '15 mins' })
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session, i18n }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)

    const sent = await this.forgotPasswordLimiter.attempt(
      `forgot_password_${request.ip()}`,
      async () => {
        await new RequestPasswordReset().handle({ email: payload.email, i18n })
        return true
      }
    )

    if (!sent) {
      session.flash('error', i18n.t('errors.E_TOO_MANY_REQUESTS'))
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    // The same answer whether or not the e-mail has an account, so the form
    // cannot tell who has one.
    session.flash('success', i18n.t('auth.forgot_password.sent'))
    return response.redirect().toRoute('auth.forgot_password.show')
  }
}
