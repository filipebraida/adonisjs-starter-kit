import type { HttpContext } from '@adonisjs/core/http'

import UpdateProfile from '#users/actions/update_profile'
import UserPolicy from '#users/policies/user_policy'
import { updateProfileValidator } from '#users/validators/users'

/** Updates the signed-in user's own name and avatar from the settings page. */
export default class UpdateProfileController {
  public async handle({ auth, bouncer, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await bouncer.with(UserPolicy).authorize('update', user)

    const payload = await request.validateUsing(updateProfileValidator)

    await new UpdateProfile().handle({
      target: user,
      fullName: payload.fullName,
      avatar: payload.avatar,
    })

    return response.redirect().toRoute('settings.index')
  }
}
