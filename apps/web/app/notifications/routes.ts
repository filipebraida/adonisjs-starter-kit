import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

const { Notifications } = controllers.notifications

router
  .group(() => {
    router.get('/notifications', [Notifications, 'index']).as('notifications.index')

    router.post('/notifications/:id/read', [Notifications, 'markRead']).as('notifications.markRead')

    router
      .post('/notifications/seen', [Notifications, 'markAllSeen'])
      .as('notifications.markAllSeen')

    router
      .post('/notifications/read', [Notifications, 'markAllRead'])
      .as('notifications.markAllRead')
  })
  .use([middleware.auth()])
