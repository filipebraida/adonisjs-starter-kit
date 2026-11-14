import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import BaseModel from '#core/models/base_model'

export type NotificationStatus = 'unseen' | 'seen' | 'read'

export interface NotificationContent {
  title?: string
  body?: string
  link?: string
  [key: string]: unknown
}

/**
 * A notification in a user's inbox, written by the Facteur database channel.
 * Its status moves from unseen to seen (the bell opened) to read (clicked).
 */
export default class Notification extends BaseModel {
  static table = 'notifications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare notifiableId: string

  @column()
  declare tenantId: string | null

  @column()
  declare type: string

  @column({
    prepare: (value: NotificationContent) => JSON.stringify(value),
  })
  declare content: NotificationContent

  @column()
  declare status: NotificationStatus

  @column({
    prepare: (value: string[] | null) => (value === null ? null : JSON.stringify(value)),
  })
  declare tags: string[] | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime()
  declare seenAt: DateTime | null
}
