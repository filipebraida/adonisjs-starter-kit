import User from '#auth/models/user'

export interface SocialUserInfo {
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface AuthenticateWithSocialInput {
  socialUser: SocialUserInfo
  locale: string
}

/**
 * Finds the account of a social sign in by its email, or creates it without
 * a password. An existing account is linked by email alone.
 */
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
