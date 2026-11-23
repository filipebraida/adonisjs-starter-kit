import Notification from '#notifications/models/notification'

export interface ListUserNotificationsInput {
  notifiableId: string
  limit?: number
  onlyUnread?: boolean
}

export interface UserNotifications {
  items: Notification[]
  unseen: number
  /** How many the person has not opened yet, in the whole inbox. */
  unread: number
}

const DEFAULT_LIMIT = 20

/** An inbox's latest notifications, newest first, with its unseen and unread counts. */
export default class ListUserNotifications {
  async handle({
    notifiableId,
    limit = DEFAULT_LIMIT,
    onlyUnread = false,
  }: ListUserNotificationsInput): Promise<UserNotifications> {
    const items = await Notification.query()
      .where('notifiableId', notifiableId)
      .if(onlyUnread, (query) => query.whereNot('status', 'read'))
      .orderBy('createdAt', 'desc')
      // Rows created in the same instant keep a stable order across reloads.
      .orderBy('id', 'desc')
      .limit(limit)

    const unseenRow = await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNull('seenAt')
      .count('* as total')
      .first()

    const unreadRow = await Notification.query()
      .where('notifiableId', notifiableId)
      .whereNot('status', 'read')
      .count('* as total')
      .first()

    return {
      items,
      unseen: Number(unseenRow?.$extras.total ?? 0),
      unread: Number(unreadRow?.$extras.total ?? 0),
    }
  }
}
