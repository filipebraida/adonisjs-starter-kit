import emitter from '@adonisjs/core/services/emitter'

import mail from '@adonisjs/mail/services/main'

import ResetPasswordNotification from '#auth/mails/reset_password_notification'

emitter.on('auth:forgot_password', async function ({ user, token, translations }) {
  await mail.send(new ResetPasswordNotification(user, token, translations))
})
