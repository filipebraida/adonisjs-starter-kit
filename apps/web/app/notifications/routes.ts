import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router
  .group(() => {
    router
      .get('/notifications', [controllers.notifications.Notifications, 'index'])
      .as('notifications.index')

    router
      .post('/notifications/:id/read', [controllers.notifications.MarkNotificationRead])
      .where('id', router.matchers.number())
      .as('notifications.markRead')

    router
      .post('/notifications/seen', [controllers.notifications.MarkAllNotificationsSeen])
      .as('notifications.markAllSeen')

    router
      .post('/notifications/read', [controllers.notifications.MarkAllNotificationsRead])
      .as('notifications.markAllRead')
  })
  .use([middleware.auth()])
