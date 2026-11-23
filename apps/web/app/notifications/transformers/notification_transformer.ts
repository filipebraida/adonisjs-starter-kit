import { BaseTransformer } from '@adonisjs/core/transformers'

import type Notification from '#notifications/models/notification'

/** A notification as the bell reads it, dates in ISO. */
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

  /** A notification as the full page reads it: only the title, the text and the content's destination. */
  forPage() {
    const { id, type, status, content, createdAt } = this.resource

    return {
      id,
      type,
      status,
      title: content.title ?? null,
      body: content.body ?? null,
      link: content.link ?? null,
      createdAt: createdAt.toISO()!,
    }
  }
}
