import User from '#users/models/user'
import PasswordResetService from '#users/services/password_reset_service'

export interface ResetPasswordInput {
  token: string
  password: string
  ip: string
}

export default class ResetPassword {
  async handle(input: ResetPasswordInput): Promise<User | null> {
    const service = new PasswordResetService()

    const record = await service.getToken(input.token)
    if (!record) return null

    const user = await User.findOrFail(record.userId)
    user.password = input.password
    await user.save()

    await Promise.all([service.deleteTokens(user), service.clearRateLimits(input.ip, user.email)])

    return user
  }
}
