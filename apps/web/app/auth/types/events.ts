import type User from '#auth/models/user'
import { type MailBasicTranslation } from '#core/models/mail_basic_translation'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'auth:forgot_password': { user: User; token: string; translations: MailBasicTranslation }
  }
}
