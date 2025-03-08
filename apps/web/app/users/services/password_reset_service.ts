import { TokenUtils } from '#common/utils/token_utils'
import ResetPasswordToken from '#users/models/reset_password_token'
import { inject } from '@adonisjs/core/container'
import { DateTime } from 'luxon'

@inject()
export default class PasswordResetService {
  async generatetoken(userId: number) {
    const token = TokenUtils.generateToken()
    const expiresAt = DateTime.now().plus({ hours: 1 })
    const resetToken = await ResetPasswordToken.updateOrCreate(
      { userId },
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
}
