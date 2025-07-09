import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'

import { inviteUserValidator } from '#users/validators'

export default class InviteController {
  public async handle({ i18n, bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    const user = await User.create({
      email: payload.email,
      roleId: payload.roleId,
    })

    await user.save()

    const translations = {
      title: i18n.t('users.emails.welcome.title', { full_name: user.fullName }),
      subtitle: i18n.t('users.emails.welcome.subtitle'),
      actionBtn: i18n.t('users.emails.welcome.action_btn'),
      defaultMessage: i18n.t('users.emails.welcome.default_message'),
    }

    emitter.emit('user:registered', {
      user: user,
      translations: translations,
      message: payload.description,
    })

    return response.redirect().toRoute('users.index')
  }
}
