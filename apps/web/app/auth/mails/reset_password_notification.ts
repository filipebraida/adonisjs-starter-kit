import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'

import type User from '#users/models/user'
import { type MailBasicTranslation } from '#common/models/mail_basic_translation'

export default class ResetPasswordNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = `Reset your password for app`

  constructor(
    private user: User,
    private token: string,
    private translations: MailBasicTranslation
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  async prepare() {
    /**
     * Generate a signed URL with the user's email,
     * which can be used to reset the password.
     */
    const signedUrl = signedUrlFor(
      'auth.reset_password.show',
      { token: this.token },
      { expiresIn: '30m', prefixUrl: env.get('APP_URL'), purpose: 'reset_password' }
    )

    const { subject, title, subtitle, actionBtn, defaultMessage } = this.translations
    this.message.to(this.user.email).subject(subject)

    this.message.htmlView('auth::emails/forgot_password', {
      title,
      subtitle,
      actionBtn,
      defaultMessage,
      signedUrl,
    })
  }
}
