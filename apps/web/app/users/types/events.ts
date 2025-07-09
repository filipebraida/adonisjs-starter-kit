import User from '#users/models/user'
import { WelcomeTranslation } from '#users/models/welcome_translation'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:registered': {
      user: User
      translations: WelcomeTranslation
      message?: string
    }
  }
}
