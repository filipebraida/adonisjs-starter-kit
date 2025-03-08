import User from '#users/models/user'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'auth:forgot_password': { user: User; token: string }
  }
}
