import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

export interface SocialUserInfo {
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface AuthenticateWithSocialInput {
  socialUser: SocialUserInfo
  locale: string
  auth: HttpContext['auth']
}

export default class AuthenticateWithSocial {
  async handle(input: AuthenticateWithSocialInput): Promise<User> {
    let user = await User.findBy('email', input.socialUser.email)

    if (!user) {
      user = await User.create({
        fullName: input.socialUser.name,
        email: input.socialUser.email,
        password: null,
        avatarUrl: input.socialUser.avatarUrl,
        locale: input.locale,
      })
    }

    await input.auth.use('web').login(user)

    return user
  }
}
