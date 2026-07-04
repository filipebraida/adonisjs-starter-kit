import { BaseTransformer } from '@adonisjs/core/transformers'

import type Notification from '#notifications/models/notification'

export default class NotificationTransformer extends BaseTransformer<Notification> {
  toObject() {
    const notification = this.resource

    return {
      id: notification.id,
      type: notification.type,
      content: notification.content,
      status: notification.status,
      tags: notification.tags,
      readAt: notification.readAt?.toISO() ?? null,
      seenAt: notification.seenAt?.toISO() ?? null,
      createdAt: notification.createdAt.toISO(),
    }
  }
}
