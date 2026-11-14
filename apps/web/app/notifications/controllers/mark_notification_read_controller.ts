import type { HttpContext } from '@adonisjs/core/http'

import MarkNotificationRead from '#notifications/actions/mark_notification_read'
import NotificationPolicy from '#notifications/policies/notification_policy'

/** Marks one notification of the user's inbox as read, answering JSON. */
export default class MarkNotificationReadController {
  async handle({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(NotificationPolicy).authorize('update')

    const notifiableId = String(auth.getUserOrFail().id)

    const notification = await new MarkNotificationRead().handle({ notifiableId, id: params.id })

    return response.json({ id: notification.id, status: notification.status })
  }
}
