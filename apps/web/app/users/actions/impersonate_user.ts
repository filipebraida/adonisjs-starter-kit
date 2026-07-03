import type { HttpContext } from '@adonisjs/core/http'

import type User from '#users/models/user'

export interface ImpersonateUserInput {
  impersonated: User
  originalUserId: number
  session: HttpContext['session']
  auth: HttpContext['auth']
}

export default class ImpersonateUser {
  async handle(input: ImpersonateUserInput): Promise<void> {
    input.session.put('originalUserId', input.originalUserId)
    await input.auth.use('web').login(input.impersonated)
  }
}
