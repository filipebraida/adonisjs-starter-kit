import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'

export interface MarkNotificationReadInput {
  notifiableId: string
  id: number | string
}

export default class MarkNotificationRead {
  // Scoped by notifiableId so a foreign id 404s instead of 403 (no existence leak).
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
