import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'

import { inviteUserValidator } from '#users/validators'

import WelcomeNotification from '#users/mails/welcome_notification'

export default class InviteController {
  public async handle({ bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    const user = await User.create({
      email: payload.email,
      roleId: payload.roleId,
    })

    await user.save()

    await mail.send(new WelcomeNotification(user, payload.description))

    return response.redirect().toRoute('users.index')
  }
}
