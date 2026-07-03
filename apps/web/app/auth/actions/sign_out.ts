import type { HttpContext } from '@adonisjs/core/http'

export interface SignOutInput {
  auth: HttpContext['auth']
}

export default class SignOut {
  async handle(input: SignOutInput): Promise<void> {
    await input.auth.use('web').logout()
  }
}
