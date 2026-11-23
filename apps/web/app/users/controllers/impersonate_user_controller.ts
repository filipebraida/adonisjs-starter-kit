import type { HttpContext } from '@adonisjs/core/http'

import { afterAuthRedirectRoute } from '#config/auth'

import ImpersonateUser from '#users/actions/impersonate_user'
import { currentImpersonation } from '#auth/enums/impersonation'
import User from '#auth/models/user'
import ImpersonatePolicy from '#users/policies/impersonate_policy'

/**
 * Signs the admin in as another user, remembering who to switch back to.
 * Nobody impersonates themselves.
 */
export default class ImpersonateUserController {
  async handle({ session, bouncer, params, response, auth }: HttpContext) {
    const impersonatedUser = await User.findOrFail(params.id)

    const mark = currentImpersonation(session, auth.user!.id)
    await bouncer.with(ImpersonatePolicy).authorize('create', impersonatedUser, mark)

    await new ImpersonateUser().handle({
      impersonated: impersonatedUser,
      originalUserId: auth.user!.id,
      session,
      auth,
    })

    return response.redirect().toRoute(afterAuthRedirectRoute)
  }
}
