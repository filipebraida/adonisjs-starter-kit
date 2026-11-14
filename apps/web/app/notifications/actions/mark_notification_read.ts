import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'

export interface MarkNotificationReadInput {
  notifiableId: string
  id: number | string
}

/**
 * Marks one notification of an inbox as read, and as seen if it was not.
 * Scoped by notifiableId, so a foreign id 404s instead of 403 and its
 * existence does not leak.
 * @throws E_ROW_NOT_FOUND if the inbox holds no such notification.
 */
export default class MarkNotificationRead {
  async handle({ notifiableId, id }: MarkNotificationReadInput): Promise<Notification> {
    const notification = await Notification.query()
      .where('notifiableId', notifiableId)
      .where('id', id)
      .firstOrFail()

    const now = DateTime.now()
    notification.status = 'read'
    notification.readAt = now
    if (!notification.seenAt) notification.seenAt = now
    await notification.save()

    return notification
  }
}
