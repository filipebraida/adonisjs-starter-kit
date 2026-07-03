import type { HttpContext } from '@adonisjs/core/http'

import RequestPasswordReset from '#auth/actions/request_password_reset'
import { forgotPasswordValidator } from '#auth/validators'

export default class ForgotPasswordController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async handle({ request, response, i18n }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)

    await new RequestPasswordReset().handle({ email: payload.email, i18n })

    return response.redirect().toRoute('auth.sign_in.show')
  }
}
