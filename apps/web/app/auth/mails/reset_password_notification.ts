import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import { urlFor } from '@adonisjs/core/services/url_builder'

import { mailContext } from '#core/utils/mail_context'
import type User from '#auth/models/user'
import { type MailBasicTranslation } from '#core/types/mail'

/** The reset password email, with the link to choose a new password. */
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
    // The token's own expiry in the database bounds the link; a signed URL
    // would add a second limit that nothing checks.
    const resetUrl = urlFor(
      'auth.reset_password.show',
      { token: this.token },
      { prefixUrl: env.get('APP_URL') }
    )

    const { subject, title, subtitle, actionBtn, defaultMessage } = this.translations
    this.message.to(this.user.email).subject(subject)

    this.message.htmlView('auth::emails/forgot_password', {
      ...mailContext(),
      title,
      subtitle,
      actionBtn,
      defaultMessage,
      resetUrl,
    })
  }
}
