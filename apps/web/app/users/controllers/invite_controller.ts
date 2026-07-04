import type { HttpContext } from '@adonisjs/core/http'

import { modal } from '#core/inertia/modal'

import InviteUser from '#users/actions/invite_user'
import UserPolicy from '#users/policies/user_policy'
import { inviteUserValidator } from '#users/validators/users'

export default class InviteController {
  public async show({ bouncer, inertia }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    return modal(inertia, 'users/invite', {}, { route: 'users.index' })
  }

  public async handle({ auth, i18n, bouncer, request, response }: HttpContext) {
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
