import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import ImpersonateUser from '#users/actions/impersonate_user'
import User from '#users/models/user'
import ImpersonatePolicy from '#users/policies/impersonate_policy'

export default class ImpersonatesController {
  async store({ session, bouncer, params, response, auth }: HttpContext) {
    const impersonatedUser = await User.findOrFail(params.id)

    await bouncer.with(ImpersonatePolicy).authorize('create', impersonatedUser)

    await new ImpersonateUser().handle({
      impersonated: impersonatedUser,
      originalUserId: auth.user!.id,
      session,
      auth,
    })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
