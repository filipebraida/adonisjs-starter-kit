import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import { updatePasswordValidator } from '#users/validators'

export default class PasswordController {
  public async show({ inertia }: HttpContext) {
    return inertia.render('users/password')
  }

  public async handle({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePasswordValidator)

    const user = await User.findOrFail(auth.user!.id)

    user.merge({
      ...payload,
    })

    await user.save()

    return response.redirect().toRoute('password.show')
  }
}
