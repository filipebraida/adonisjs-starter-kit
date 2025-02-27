import { BaseMail } from '@adonisjs/mail'
import router from '@adonisjs/core/services/router'

import User from '#users/models/user'

export default class ResetPasswordNotification extends BaseMail {
  from = 'delivered@resend.dev'
  subject = `Reset your password for app`

  constructor(private user: User) {
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
    const signedUrl = router.makeSignedUrl(
      'auth.reset_password.show',
      { email: this.user.email },
      { expiresIn: '30m', prefixUrl: 'http://localhost:3333', purpose: 'reset_password' }
    )

    this.message.to('delivered@resend.dev')

    this.message.htmlView('auth::emails/forgot_password', { user: this.user, signedUrl })
  }
}
