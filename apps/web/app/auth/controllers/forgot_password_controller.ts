import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import User from '#users/models/user'

import { forgotPasswordValidator } from '#auth/validators'

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
      return response.redirect().toRoute('auth.forgot_password.show')
    }

    /**
     * Send an email with the signed URL.
     */
    emitter.emit('auth:forgot_password', user)

    /**
     * Redirect back with a success message.
     */
    return response.redirect().toRoute('auth.forgot_password.show')
  }
}
