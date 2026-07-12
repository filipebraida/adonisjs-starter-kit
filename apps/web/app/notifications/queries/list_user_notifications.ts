import Notification from '#notifications/models/notification'

export interface ListUserNotificationsInput {
  notifiableId: string
  limit?: number
}

export interface UserNotifications {
  items: Notification[]
  unseen: number
}

const DEFAULT_LIMIT = 20

export default class ListUserNotifications {
  async handle({
    notifiableId,
    limit = DEFAULT_LIMIT,
  }: ListUserNotificationsInput): Promise<UserNotifications> {
    const items = await Notification.query()
      .where('notifiableId', notifiableId)
      .orderBy('createdAt', 'desc')
      .limit(limit)

    const unseenRow = await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNull('seenAt')
      .count('* as total')
      .first()

    return {
      items,
      unseen: Number(unseenRow?.$extras.total ?? 0),
    }
  }
}
