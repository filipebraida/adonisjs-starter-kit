import { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import { resetPasswordValidator } from '#auth/validators'

export default class ResetPasswordController {
  async show({ request, inertia, response }: HttpContext) {
    /**
     * Verify the request signature before proceeding.
     */
    if (!request.hasValidSignature('reset_password')) {
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Render the "Reset Password" page.
     */
    return inertia.render('auth/reset_password')
  }

  async handle({ request, params, response }: HttpContext) {
    /**
     * Verify the request signature before proceeding.
     */
    if (!request.hasValidSignature('reset_password')) {
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Validate the request input.
     */
    const validatedData = await request.validateUsing(resetPasswordValidator)

    /**
     * Handle the password reset request.
     */
    const user = await User.findByOrFail('email', params.email)
    user.password = validatedData.password
    await user.save()

    /**
     * Redirect to the login page.
     */
    return response.redirect().toRoute('auth.sign_in.show')
  }
}
