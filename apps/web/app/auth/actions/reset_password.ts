import User from '#auth/models/user'
import LoginLimiter from '#auth/services/login_limiter'
import PasswordResetService from '#auth/services/password_reset_service'

export interface ResetPasswordInput {
  token: string
  password: string
  ip: string
}

/**
 * Resets a password from a reset token. Returns null for an unknown or
 * expired token; on success the user's tokens and sign in rate limit are cleared.
 */
export default class ResetPassword {
  async handle(input: ResetPasswordInput): Promise<User | null> {
    const service = new PasswordResetService()

    const record = await service.getToken(input.token)
    if (!record) return null

    const user = await User.findOrFail(record.userId)
    user.password = input.password
    await user.save()

    await Promise.all([service.deleteTokens(user), new LoginLimiter().clear(input.ip, user.email)])

    return user
  }
}
