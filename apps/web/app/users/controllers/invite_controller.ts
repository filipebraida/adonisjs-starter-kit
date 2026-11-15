import type { HttpContext } from '@adonisjs/core/http'

import InviteUser from '#users/actions/invite_user'
import { institutionalRoles } from '#auth/queries/roles_query'
import UserPolicy from '#users/policies/user_policy'
import { inviteUserValidator } from '#users/validators/users'

/**
 * The invite form and its submit, which creates the account and mails the
 * invitee a link to choose a password.
 */
export default class InviteController {
  public async show({ bouncer, inertia }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    return inertia.modal(
      'users/invite',
      { institutionalRoles: await institutionalRoles() },
      { route: 'users.index' }
    )
  }

  public async store({ auth, i18n, bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    await new InviteUser().handle({
      email: payload.email,
      role: payload.role,
      description: payload.description,
      executor: auth.user!,
      i18n,
    })

    return response.redirect().toRoute('users.index')
  }
}
