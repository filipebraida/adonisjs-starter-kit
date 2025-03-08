import { TokenUtils } from '#common/utils/token_utils'
import ResetPasswordToken from '#users/models/reset_password_token'
import User from '#users/models/user'
import { DateTime } from 'luxon'

export default class PasswordResetService {
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
}
