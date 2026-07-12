import type { HttpContext } from '@adonisjs/core/http'

import MarkAllNotificationsRead from '#notifications/actions/mark_all_notifications_read'
import MarkAllNotificationsSeen from '#notifications/actions/mark_all_notifications_seen'
import MarkNotificationRead from '#notifications/actions/mark_notification_read'
import ListUserNotifications from '#notifications/queries/list_user_notifications'
import NotificationTransformer from '#notifications/transformers/notification_transformer'

export default class NotificationsController {
  async index({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    const { items, unseen } = await new ListUserNotifications().handle({ notifiableId })

    // toObject(): the .transform() pipeline resolves async and response.json() can't await it.
    return response.json({
      items: items.map((item) => new NotificationTransformer(item).toObject()),
      unseen,
    })
  }

  async markRead({ auth, params, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    const notification = await new MarkNotificationRead().handle({ notifiableId, id: params.id })

    return response.json({ id: notification.id, status: notification.status })
  }

  async markAllSeen({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    await new MarkAllNotificationsSeen().handle({ notifiableId })

    return response.json({ ok: true })
  }

  async markAllRead({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    await new MarkAllNotificationsRead().handle({ notifiableId })

    return response.json({ ok: true })
  }
}
