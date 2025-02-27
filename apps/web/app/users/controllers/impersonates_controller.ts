import type { HttpContext } from '@adonisjs/core/http'
import { afterAuthRedirectRoute } from '#config/auth'

import User from '#users/models/user'

import ImpersonatePolicy from '#users/policies/impersonate_policy'

export default class ImpersonatesController {
  async store({ session, bouncer, params, response, auth }: HttpContext) {
    const impersonatedUser = await User.findOrFail(params.id)

    await bouncer.with(ImpersonatePolicy).authorize('create', impersonatedUser)

    session.put('originalUserId', auth.user!.id)
    await auth.use('web').login(impersonatedUser)

    response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
