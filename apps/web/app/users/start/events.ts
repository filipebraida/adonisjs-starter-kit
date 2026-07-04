import emitter from '@adonisjs/core/services/emitter'

import mail from '@adonisjs/mail/services/main'
import facteur from '@facteurjs/adonisjs/services/main'

import WelcomeNotification from '#users/mails/welcome_notification'
import UserWelcomeNotification from '#users/notifications/user_welcome_notification'

emitter.on('user:registered', async function (data) {
  await mail.send(new WelcomeNotification(data.user, data.token, data.translations, data.message))

  await facteur
    .notification(UserWelcomeNotification)
    .params({
      title: data.translations.title,
      body: data.translations.subtitle,
      link: '/settings',
    })
    .to([data.user])
    .send()
})
