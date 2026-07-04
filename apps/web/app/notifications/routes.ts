import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const NotificationsController = () => import('#notifications/controllers/notifications_controller')

router
  .group(() => {
    router.get('/notifications', [NotificationsController, 'index']).as('notifications.index')

    router
      .post('/notifications/:id/read', [NotificationsController, 'markRead'])
      .as('notifications.markRead')

    router
      .post('/notifications/seen', [NotificationsController, 'markAllSeen'])
      .as('notifications.markAllSeen')

    router
      .post('/notifications/read', [NotificationsController, 'markAllRead'])
      .as('notifications.markAllRead')
  })
  .use([middleware.auth()])
