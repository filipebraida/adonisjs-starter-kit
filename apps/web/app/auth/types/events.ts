import User from '#users/models/user'
import { MailBasicTranslation } from '#common/models/mail_basic_translation'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'auth:forgot_password': { user: User; token: string; translations: MailBasicTranslation }
  }
}
