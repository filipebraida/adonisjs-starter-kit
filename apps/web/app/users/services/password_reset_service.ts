import { TokenUtils } from '#common/utils/token_utils'
import { DateTime } from 'luxon'

import User from '#users/models/user'
import ResetPasswordToken from '#users/models/reset_password_token'
import { Limiter } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'

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

    const resetToken = await ResetPasswordToken.updateOrCreate(
      { userId: user.id },
      {
        token,
        expiresAt,
      }
    )
    return { token: resetToken.token, expiresAt: resetToken.expiresAt }
  }

  async getToken(token: string) {
    const resetToken = await ResetPasswordToken.query()
      .where('token', token)
      .andWhere('expires_at', '>', DateTime.now().toSQL())
      .first()
    return resetToken
  }

  async deleteTokens(user: User) {
    await ResetPasswordToken.query().where('userId', user.id).delete()
  }

  async clearRateLimits(ip: string, email: string) {
    return this.loginLimiter.delete(this.getRateKey(ip, email))
  }
  getRateKey(ip: string, email: string) {
    return `login_${ip}_${email}`
  }
}
