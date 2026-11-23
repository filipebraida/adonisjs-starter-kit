import { TokenUtils } from '#core/utils/token_utils'
import { DateTime, type DurationLike } from 'luxon'

import type User from '#auth/models/user'
import ResetPasswordToken from '#auth/models/reset_password_token'

/**
 * Issues, looks up and revokes password reset tokens. A user holds at most
 * one token, valid for an hour, or a week for an invitation.
 */
export default class PasswordResetService {
  async generateToken(user: User, validFor: DurationLike = { hours: 1 }) {
    const token = TokenUtils.generateToken()
    const expiresAt = DateTime.now().plus(validFor)

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
}
