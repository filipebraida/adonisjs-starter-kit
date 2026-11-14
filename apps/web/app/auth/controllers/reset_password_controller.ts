import type { HttpContext } from '@adonisjs/core/http'

import ResetPassword from '#auth/actions/reset_password'
import { resetPasswordValidator } from '#auth/validators/auth'
import PasswordResetService from '#auth/services/password_reset_service'

/**
 * The reset password form reached from the mailed link, and its submit.
 * Public: the token in the URL is the credential. An unknown or expired token
 * sends the visitor back to the forgot password form.
 */
export default class ResetPasswordController {
  static readonly public = true

  async show({ params, inertia, response, session }: HttpContext) {
    const record = await new PasswordResetService().getToken(params.token)

    if (!record) {
      session.flash('error', 'auth.reset_password.error.invalid_or_expired')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    return inertia.render('auth/reset_password', { token: record.token })
  }

  async store({ request, params, response, session }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)

    const user = await new ResetPassword().handle({
      token: params.token,
      password: payload.password,
      ip: request.ip(),
    })

    if (!user) {
      session.flash('error', 'auth.reset_password.error.invalid_or_expired')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    return response.redirect().toRoute('auth.sign_in.show')
  }
}
