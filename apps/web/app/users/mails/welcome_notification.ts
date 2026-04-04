import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'

import type User from '#users/models/user'
import { type MailBasicTranslation } from '#common/models/mail_basic_translation'

export default class WelcomeNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = 'Welcome!'

  constructor(
    private user: User,
    private token: string,
    private translations: MailBasicTranslation,
    private welcomeMessage?: string
  ) {
    super()
    this.subject = this.translations.subject
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
    const welcomeUrl = signedUrlFor(
      'auth.reset_password.show',
      { token: this.token },
      { expiresIn: '30m', prefixUrl: env.get('APP_URL'), purpose: 'reset_password' }
    )

    const { subject, title, subtitle, actionBtn, defaultMessage } = this.translations

    this.message.to(this.user.email).subject(subject)

    this.message.htmlView('users::emails/welcome', {
      title: title,
      subtitle: subtitle,
      actionBtn: actionBtn,
      defaultMessage: defaultMessage,
      welcomeUrl,
      welcomeMessage: this.welcomeMessage,
    })
  }
}
