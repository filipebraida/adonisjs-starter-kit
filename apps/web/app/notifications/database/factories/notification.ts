import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'

export const NotificationFactory = Factory.define(Notification, ({ faker }) => {
  return {
    type: 'test',
    content: { title: faker.lorem.words(3) },
    status: 'unseen' as const,
  }
})
  .state('seen', (notification) => {
    notification.status = 'seen'
    notification.seenAt = DateTime.now()
  })
  .state('read', (notification) => {
    notification.status = 'read'
    notification.readAt = DateTime.now()
    notification.seenAt = DateTime.now()
  })
  .build()
