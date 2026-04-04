import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'
import PasswordResetService from '#users/services/password_reset_service'

import { inviteUserValidator } from '#users/validators'

@inject()
export default class InviteController {
  constructor(private passwordResetService: PasswordResetService) {}

  public async handle({ i18n, bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('invite')

    const payload = await request.validateUsing(inviteUserValidator)

    const user = await User.create({
      email: payload.email,
      roleId: payload.roleId,
    })

    await user.save()

    const { token } = await this.passwordResetService.generateToken(user)

    const translations = {
      subject: i18n.t('users.emails.welcome.subject'),
      title: i18n.t('users.emails.welcome.title', { full_name: user.fullName ?? user.email }),
      subtitle: i18n.t('users.emails.welcome.subtitle'),
      actionBtn: i18n.t('users.emails.welcome.action_btn'),
      defaultMessage: i18n.t('users.emails.welcome.default_message'),
    }

    emitter.emit('user:registered', {
      user: user,
      token,
      translations: translations,
      message: payload.description,
    })

    return response.redirect().toRoute('users.index')
  }
}
