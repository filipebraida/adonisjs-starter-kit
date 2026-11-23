import emitter from '@adonisjs/core/services/emitter'
import type { I18n } from '@adonisjs/i18n'

import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'

export interface RequestPasswordResetInput {
  email: string
  i18n: I18n
}

/**
 * Requests a password reset: issues a token and emits `auth:forgot_password`,
 * whose listener mails the link. An unknown email is a silent no-op, so the
 * form cannot be used to find out who has an account.
 */
export default class RequestPasswordReset {
  async handle(input: RequestPasswordResetInput): Promise<void> {
    const user = await User.findBy('email', input.email)
    if (!user) return

    // A link still valid is sent again rather than replaced: otherwise anyone
    // who knows the e-mail could cancel a pending reset or invitation.
    const service = new PasswordResetService()
    const pending = await service.validTokenOf(user)
    const { token } = pending ?? (await service.generateToken(user))

    const translations = {
      subject: input.i18n.t('auth.emails.reset_password.subject'),
      title: input.i18n.t('auth.emails.reset_password.title'),
      subtitle: input.i18n.t('auth.emails.reset_password.subtitle'),
      actionBtn: input.i18n.t('auth.emails.reset_password.action_btn'),
      defaultMessage: input.i18n.t('auth.emails.reset_password.default_message'),
    }

    await emitter.emit('auth:forgot_password', { user, token, translations })
  }
}
