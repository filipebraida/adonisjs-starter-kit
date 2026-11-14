import type { HttpContext } from '@adonisjs/core/http'

import NotificationPolicy from '#notifications/policies/notification_policy'
import ListUserNotifications from '#notifications/queries/list_user_notifications'
import NotificationTransformer from '#notifications/transformers/notification_transformer'

/** The bell's feed, as JSON: the latest notifications and the unseen count. */
export default class NotificationsController {
  async index({ auth, bouncer, response }: HttpContext) {
    await bouncer.with(NotificationPolicy).authorize('viewList')

    const notifiableId = String(auth.getUserOrFail().id)

    const { items, unseen } = await new ListUserNotifications().handle({ notifiableId })

    // toObject(): the .transform() pipeline resolves async and response.json() can't await it.
    return response.json({
      items: items.map((item) => new NotificationTransformer(item).toObject()),
      unseen,
    })
  }
}
