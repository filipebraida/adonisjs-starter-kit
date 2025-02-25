import { BaseModelDto } from '@adocasts.com/dto/base'
import User from '#users/models/user'

export default class UserDto extends BaseModelDto {
  declare id: number
  declare roleId: number
  declare fullName: string | null
  declare email: string
  declare createdAt: string
  declare updatedAt: string

  constructor(user?: User) {
    super()

    if (!user) return

    this.id = user.id
    this.roleId = user.roleId
    this.fullName = user.fullName
    this.email = user.email
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt ? user.updatedAt.toISO()! : ''
  }
}
