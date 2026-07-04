import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  locale: string
  auth: HttpContext['auth']
}

export default class SignUp {
  async handle(input: SignUpInput): Promise<User> {
    const user = await User.create({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      locale: input.locale,
    })

    await input.auth.use('web').login(user)

    return user
  }
}
