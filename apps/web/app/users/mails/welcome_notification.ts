import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import { urlFor } from '@adonisjs/core/services/url_builder'

import { mailContext } from '#core/utils/mail_context'
import type User from '#auth/models/user'
import { type MailBasicTranslation } from '#core/types/mail'

/** The invitation email, with the link to choose a password. */
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
    // The token's own expiry in the database bounds the link; a signed URL
    // would add a second limit that nothing checks.
    const welcomeUrl = urlFor(
      'auth.reset_password.show',
      { token: this.token },
      { prefixUrl: env.get('APP_URL') }
    )

    const { subject, title, subtitle, actionBtn, defaultMessage } = this.translations

    this.message.to(this.user.email).subject(subject)

    this.message.htmlView('users::emails/welcome', {
      ...mailContext(),
      title,
      subtitle,
      actionBtn,
      defaultMessage,
      welcomeUrl,
      welcomeMessage: this.welcomeMessage,
    })
  }
}
