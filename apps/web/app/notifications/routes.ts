import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'

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

// The bell's realtime feed: SSE endpoints for signed-in users only, and each
// user may subscribe to their own channel and no one else's.
transmit.registerRoutes((route) => route.use(middleware.auth()))

transmit.authorize<{ id: string }>(
  'notifications/users/:id',
  (ctx, { id }) => ctx.auth.user?.id === Number(id)
)
