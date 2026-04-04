import type User from '#users/models/user'
import { type MailBasicTranslation } from '#common/models/mail_basic_translation'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:registered': {
      user: User
      token: string
      translations: MailBasicTranslation
      message?: string
    }
  }
}
