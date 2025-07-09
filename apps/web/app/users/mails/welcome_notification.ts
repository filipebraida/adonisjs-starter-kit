import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import router from '@adonisjs/core/services/router'

import User from '#users/models/user'
import { WelcomeTranslation } from '#users/models/welcome_translation'

export default class WelcomeNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = 'Welcome!'

  constructor(
    private user: User,
    private translations: WelcomeTranslation,
    private welcomeMessage?: string
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
    const welcomeUrl = router.makeUrl(
      'marketing.show',
      { email: this.user.email },
      { prefixUrl: env.get('VITE_API_URL') }
    )

    this.message.to(this.user.email)

    const { title, subtitle, actionBtn, defaultMessage } = this.translations
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
