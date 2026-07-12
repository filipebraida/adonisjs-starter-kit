import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'

export interface MarkAllNotificationsSeenInput {
  notifiableId: string
}

export default class MarkAllNotificationsSeen {
  async handle({ notifiableId }: MarkAllNotificationsSeenInput): Promise<void> {
    const now = DateTime.now()

    await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNull('seenAt')
      .update({ status: 'seen', seenAt: now, updatedAt: now })
  }
}
