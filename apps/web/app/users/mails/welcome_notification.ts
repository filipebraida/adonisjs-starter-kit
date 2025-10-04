import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import router from '@adonisjs/core/services/router'

import User from '#users/models/user'
import { MailBasicTranslation } from '#common/models/mail_basic_translation'

export default class WelcomeNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = 'Welcome!'

  constructor(
    private user: User,
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
    const welcomeUrl = router.makeUrl(
      'marketing.show',
      { email: this.user.email },
      { prefixUrl: env.get('VITE_API_URL') }
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
