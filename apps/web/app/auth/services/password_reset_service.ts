import { TokenUtils } from '#core/utils/token_utils'
import { DateTime } from 'luxon'

import type User from '#auth/models/user'
import ResetPasswordToken from '#auth/models/reset_password_token'
import { type Limiter } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'

/**
 * Issues, looks up and revokes password reset tokens. A user holds at most
 * one token, valid for an hour; a successful reset also clears the sign in
 * rate limit of that IP and email.
 */
export default class PasswordResetService {
  loginLimiter: Limiter
  constructor() {
    this.loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }
  async generateToken(user: User) {
    const token = TokenUtils.generateToken()
    const expiresAt = DateTime.now().plus({ hours: 1 })

    await this.deleteTokens(user)

    const resetToken = await user.related('resetPasswordTokens').create({ token, expiresAt })
    return { token: resetToken.token, expiresAt: resetToken.expiresAt }
  }

  /** The user's token while it is still valid, or null. */
  async validTokenOf(user: User) {
    return user
      .related('resetPasswordTokens')
      .query()
      .where('expires_at', '>', DateTime.now().toSQL())
      .first()
  }

  async getToken(token: string) {
    const resetToken = await ResetPasswordToken.query()
      .where('token', token)
      .andWhere('expires_at', '>', DateTime.now().toSQL())
      .first()
    return resetToken
  }

  async deleteTokens(user: User) {
    await user.related('resetPasswordTokens').query().delete()
  }

  async clearRateLimits(ip: string, email: string) {
    return this.loginLimiter.delete(this.getRateKey(ip, email))
  }
  getRateKey(ip: string, email: string) {
    return `login_${ip}_${email}`
  }
}
