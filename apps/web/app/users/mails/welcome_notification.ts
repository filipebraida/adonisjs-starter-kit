import { BaseMail } from '@adonisjs/mail'
import router from '@adonisjs/core/services/router'

import User from '#users/models/user'

export default class WelcomeNotification extends BaseMail {
  from = 'delivered@resend.dev'
  subject = 'Welcome!'

  constructor(
    private user: User,
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
      { prefixUrl: 'http://localhost:3333' }
    )

    this.message.to('delivered@resend.dev')

    this.message.htmlView('users::emails/welcome', {
      user: this.user,
      welcomeUrl,
      welcomeMessage: this.welcomeMessage,
    })
  }
}
