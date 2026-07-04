import type { HttpContext } from '@adonisjs/core/http'

import UpdatePassword from '#users/actions/update_password'
import User from '#users/models/user'
import { updatePasswordValidator } from '#users/validators/users'

export default class PasswordController {
  public async handle({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePasswordValidator)

    const user = await User.findOrFail(auth.user!.id)

    await new UpdatePassword().handle({ target: user, password: payload.password })

    return response.redirect().toRoute('settings.index')
  }
}
