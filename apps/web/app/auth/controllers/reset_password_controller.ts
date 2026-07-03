import type { HttpContext } from '@adonisjs/core/http'

import ResetPassword from '#auth/actions/reset_password'
import { resetPasswordValidator } from '#auth/validators'
import PasswordResetService from '#users/services/password_reset_service'

export default class ResetPasswordController {
  async show({ params, inertia, response, session }: HttpContext) {
    const record = await new PasswordResetService().getToken(params.token)

    if (!record) {
      session.flash('error', 'auth.reset_password.error.invalid_or_expired')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    return inertia.render('auth/reset_password', { token: record.token })
  }

  async handle({ request, params, response, session }: HttpContext) {
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
