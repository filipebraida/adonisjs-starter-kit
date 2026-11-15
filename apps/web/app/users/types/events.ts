import type User from '#auth/models/user'
import { type MailBasicTranslation } from '#core/types/mail'

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
