import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'

import { inviteUserValidator } from '#users/validators'

export default class InviteController {
  public async handle({ bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    const user = await User.create({
      email: payload.email,
      roleId: payload.roleId,
    })

    await user.save()

    emitter.emit('user:registered', { user: user, message: payload.description })

    return response.redirect().toRoute('users.index')
  }
}
