import { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import { resetPasswordValidator } from '#auth/validators'
import PasswordResetService from '#users/services/password_reset_service'
import { inject } from '@adonisjs/core/container'

@inject()
export default class ResetPasswordController {
  constructor(private passwordResetService: PasswordResetService) {}

  async show({ params, inertia, response, session }: HttpContext) {
    /**
     * Verify the request signature before proceeding.
     */
    const token = await this.passwordResetService.getToken(params.token)

    if (!token) {
      session.flash('resetPasswordError', 'true')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Render the "Reset Password" page.
     */
    return inertia.render('auth/reset_password')
  }

  async handle({ request, params, response, session }: HttpContext) {
    /**
     * Validate the token validity
     */
    const token = await this.passwordResetService.getToken(params.token)

    if (!token) {
      session.flash('resetPasswordError', 'true')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Validate the request input.
     */
    const validatedData = await request.validateUsing(resetPasswordValidator)

    /**
     * Handle the password reset request.
     */
    const user = await User.findOrFail(token.userId)
    user.password = validatedData.password
    await user.save()

    await this.passwordResetService.deleteTokens(user)

    /**
     * Redirect to the login page.
     */
    return response.redirect().toRoute('auth.sign_in.show')
  }
}
