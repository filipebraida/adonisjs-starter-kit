import emitter from '@adonisjs/core/services/emitter'
import type { I18n } from '@adonisjs/i18n'

import User from '#users/models/user'
import PasswordResetService from '#users/services/password_reset_service'

export interface RequestPasswordResetInput {
  email: string
  i18n: I18n
}

export default class RequestPasswordReset {
  // Silent no-op when the email is not registered — prevents user enumeration.
  async handle(input: RequestPasswordResetInput): Promise<void> {
    const user = await User.findBy('email', input.email)
    if (!user) return

    const { token } = await new PasswordResetService().generateToken(user)

    const translations = {
      subject: input.i18n.t('auth.emails.reset_password.subject'),
      title: input.i18n.t('auth.emails.reset_password.title'),
      subtitle: input.i18n.t('auth.emails.reset_password.subtitle'),
      actionBtn: input.i18n.t('auth.emails.reset_password.action_btn'),
      defaultMessage: input.i18n.t('auth.emails.reset_password.default_message'),
    }

    emitter.emit('auth:forgot_password', { user, token, translations })
  }
}
