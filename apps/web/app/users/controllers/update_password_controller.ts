import type { HttpContext } from '@adonisjs/core/http'

import UpdatePassword from '#users/actions/update_password'
import UserPolicy from '#users/policies/user_policy'
import { updatePasswordValidator } from '#users/validators/users'

/** Changes the signed-in user's own password from the settings page. */
export default class UpdatePasswordController {
  public async handle({ auth, bouncer, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await bouncer.with(UserPolicy).authorize('update', user)

    const payload = await request.validateUsing(updatePasswordValidator)

    await new UpdatePassword().handle({ target: user, password: payload.password })

    return response.redirect().toRoute('settings.index')
  }
}
