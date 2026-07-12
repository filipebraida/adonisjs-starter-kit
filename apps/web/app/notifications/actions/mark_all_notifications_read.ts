import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'

export interface MarkAllNotificationsReadInput {
  notifiableId: string
}

export default class MarkAllNotificationsRead {
  async handle({ notifiableId }: MarkAllNotificationsReadInput): Promise<void> {
    const now = DateTime.now()

    await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNot('status', 'read')
      .update({ status: 'read', readAt: now, seenAt: now, updatedAt: now })
  }
}
