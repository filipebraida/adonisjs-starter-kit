import type { HttpContext } from '@adonisjs/core/http'

import NotificationPolicy from '#notifications/policies/notification_policy'
import ListUserNotifications from '#notifications/queries/list_user_notifications'
import NotificationTransformer from '#notifications/transformers/notification_transformer'
import { listNotificationsValidator } from '#notifications/validators/notifications'

// How many the full page shows: it is the recent inbox, not an archive.
const NOTIFICATIONS_ON_THE_PAGE = 50

/**
 * The signed-in user's inbox. The bell asks for it as JSON, the latest ones
 * and the unseen count; a browser visit opens the full page, with the slice of
 * the unread ones.
 */
export default class NotificationsController {
  async index({ auth, bouncer, inertia, request, response }: HttpContext) {
    await bouncer.with(NotificationPolicy).authorize('viewList')

    const notifiableId = String(auth.getUserOrFail().id)

    if (request.accepts(['html', 'json']) === 'json') {
      const { items, unseen } = await new ListUserNotifications().handle({ notifiableId })

      // toObject(): the .transform() pipeline resolves async and response.json() can't await it.
      return response.json({
        items: items.map((item) => new NotificationTransformer(item).toObject()),
        unseen,
      })
    }

    const { filter } = await request.validateUsing(listNotificationsValidator, {
      data: request.qs(),
    })
    const { items, unread } = await new ListUserNotifications().handle({
      notifiableId,
      limit: NOTIFICATIONS_ON_THE_PAGE,
      onlyUnread: filter === 'unread',
    })

    return inertia.render('notifications/index', {
      notifications: NotificationTransformer.transform(items).useVariant('forPage'),
      unread,
      // null, not undefined: a partial reload keeps a missing prop's old value.
      filter: filter ?? null,
    })
  }
}
