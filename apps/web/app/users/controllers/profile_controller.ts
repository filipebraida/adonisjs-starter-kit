import type { HttpContext } from '@adonisjs/core/http'

import UpdateProfile from '#users/actions/update_profile'
import User from '#users/models/user'
import { updateProfileValidator } from '#users/validators/users'

export default class ProfileController {
  public async handle({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateProfileValidator)

    const user = await User.findOrFail(auth.user!.id)

    await new UpdateProfile().handle({
      target: user,
      fullName: payload.fullName,
      avatar: payload.avatar,
    })

    return response.redirect().toRoute('settings.index')
  }
}
