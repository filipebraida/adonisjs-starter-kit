import type { HttpContext } from '@adonisjs/core/http'

import MarkAllNotificationsSeen from '#notifications/actions/mark_all_notifications_seen'
import NotificationPolicy from '#notifications/policies/notification_policy'

/** Marks every notification of the user's inbox as seen, clearing the bell's badge. */
export default class MarkAllNotificationsSeenController {
  async handle({ auth, bouncer, response }: HttpContext) {
    await bouncer.with(NotificationPolicy).authorize('update')

    const notifiableId = String(auth.getUserOrFail().id)

    await new MarkAllNotificationsSeen().handle({ notifiableId })

    return response.json({ ok: true })
  }
}
