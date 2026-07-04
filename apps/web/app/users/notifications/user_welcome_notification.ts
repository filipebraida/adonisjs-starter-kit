import { DatabaseMessage } from '@facteurjs/adonisjs/channels/database'
import { TransmitMessage } from '@facteurjs/adonisjs/channels/transmit'
import { Notification } from '@facteurjs/adonisjs/types'

import type User from '#users/models/user'

export interface UserWelcomeParams {
  title: string
  body: string
  link: string
}

/**
 * Delivered on user:registered — welcomes the freshly invited or signed-up
 * user (in-app persistence + realtime SSE). The transactional email is a
 * separate channel handled by the existing WelcomeNotification mail.
 */
export default class UserWelcomeNotification extends Notification<User, UserWelcomeParams> {
  static options = {
    name: 'user-welcome',
    deliverBy: { database: true, transmit: true },
  }

  asDatabaseMessage() {
    const { title, body, link } = this.params

    return DatabaseMessage.create()
      .setType('user-welcome')
      .setContent({ title, body, link })
      .setTags(['user-welcome'])
  }

  asTransmitMessage() {
    return TransmitMessage.create().setContent({ kind: 'user-welcome' })
  }
}
