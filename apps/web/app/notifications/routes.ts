import app from '@adonisjs/core/services/app'
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

// An open event stream never ends on its own, and on shutdown the HTTP server
// waits for every connection before the Transmit provider gets to close them:
// with a tab signed in, the process would hang. The streams must close first.
// Terminating hooks run in reverse order and the HTTP server registers its own
// once it listens, so this one is registered after that, when the app is ready.
app.ready(() => {
  app.terminating(() => transmit.closeAllStreams())
})
