import User from '#users/models/user'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:registered': { user: User; message?: string }
  }
}
