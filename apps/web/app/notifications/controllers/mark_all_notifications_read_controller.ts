import type { HttpContext } from '@adonisjs/core/http'

import MarkAllNotificationsRead from '#notifications/actions/mark_all_notifications_read'
import NotificationPolicy from '#notifications/policies/notification_policy'

/** Marks every notification of the user's inbox as read, and so as seen. */
export default class MarkAllNotificationsReadController {
  async handle({ auth, bouncer, response }: HttpContext) {
    await bouncer.with(NotificationPolicy).authorize('update')

    const notifiableId = String(auth.getUserOrFail().id)

    await new MarkAllNotificationsRead().handle({ notifiableId })

    return response.json({ ok: true })
  }
}
