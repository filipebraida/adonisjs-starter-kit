import User from '#users/models/user'

export interface SocialUserInfo {
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface AuthenticateWithSocialInput {
  socialUser: SocialUserInfo
  locale: string
}

export default class AuthenticateWithSocial {
  async handle(input: AuthenticateWithSocialInput): Promise<User> {
    const existing = await User.findBy('email', input.socialUser.email)
    if (existing) return existing

    return User.create({
      fullName: input.socialUser.name,
      email: input.socialUser.email,
      password: null,
      avatarUrl: input.socialUser.avatarUrl,
      locale: input.locale,
    })
  }
}
