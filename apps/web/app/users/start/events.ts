import emitter from '@adonisjs/core/services/emitter'

import mail from '@adonisjs/mail/services/main'

import WelcomeNotification from '#users/mails/welcome_notification'

emitter.on('user:registered', async function (data) {
  await mail.send(new WelcomeNotification(data.user, data.message))
})
