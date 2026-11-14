import type { HttpContext } from '@adonisjs/core/http'

import RequestPasswordReset from '#auth/actions/request_password_reset'
import { forgotPasswordValidator } from '#auth/validators/auth'

/**
 * The forgot password form and its submit, which mails a reset link.
 * Public: the visitor has lost access to the account.
 */
export default class ForgotPasswordController {
  static readonly public = true

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, i18n }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)

    await new RequestPasswordReset().handle({ email: payload.email, i18n })

    return response.redirect().toRoute('auth.sign_in.show')
  }
}
