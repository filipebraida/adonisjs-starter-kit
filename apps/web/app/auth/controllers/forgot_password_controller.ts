import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

import User from '#users/models/user'

import { forgotPasswordValidator } from '#auth/validators'

import ResetPasswordNotification from '#auth/mails/reset_password_notification'

export default class ForgotPasswordController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password')
  }

  async handle({ request, response, session }: HttpContext) {
    /**
     * Validate the email input.
     */
    const validatedData = await request.validateUsing(forgotPasswordValidator)

    /**
     * Check if the user exists, if not,
     * flash a success message to prevent user enumeration.
     */
    const user = await User.findBy('email', validatedData.email)
    if (!user) {
      session.flash('success', 'true')
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Send an email with the signed URL.
     */
    await mail.send(new ResetPasswordNotification(user))

    /**
     * Redirect back with a success message.
     */
    session.flash('success', 'true')
    return response.redirect().toRoute('auth.forgot_password.show')
  }
}
