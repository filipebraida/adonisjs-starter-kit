import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'
import NotificationTransformer from '#notifications/transformers/notification_transformer'

const LIST_LIMIT = 20

export default class NotificationsController {
  async index({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    const items = await Notification.query()
      .where('notifiableId', notifiableId)
      .orderBy('createdAt', 'desc')
      .limit(LIST_LIMIT)

    const unseenRow = await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNull('seenAt')
      .count('* as total')
      .first()

    return response.json({
      items: items.map((item) => new NotificationTransformer(item).toObject()),
      unseen: Number(unseenRow?.$extras.total ?? 0),
    })
  }

  async markRead({ auth, params, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)

    const notification = await Notification.query()
      .where('notifiableId', notifiableId)
      .where('id', params.id)
      .firstOrFail()

    const now = DateTime.now()
    notification.status = 'read'
    notification.readAt = now
    if (!notification.seenAt) notification.seenAt = now
    await notification.save()

    return response.json({ id: notification.id, status: notification.status })
  }

  async markAllSeen({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)
    const now = DateTime.now()

    await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNull('seenAt')
      .update({ status: 'seen', seenAt: now, updatedAt: now })

    return response.json({ ok: true })
  }

  async markAllRead({ auth, response }: HttpContext) {
    const notifiableId = String(auth.getUserOrFail().id)
    const now = DateTime.now()

    await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNot('status', 'read')
      .update({ status: 'read', readAt: now, seenAt: now, updatedAt: now })

    return response.json({ ok: true })
  }
}
