import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

export interface SignInInput {
  email: string
  password: string
  auth: HttpContext['auth']
  session: HttpContext['session']
}

export default class SignIn {
  async handle(input: SignInInput): Promise<User> {
    input.session.regenerate()
    const user = await User.verifyCredentials(input.email, input.password)
    await input.auth.use('web').login(user)
    return user
  }
}
