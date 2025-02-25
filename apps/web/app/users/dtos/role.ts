import { BaseModelDto } from '@adocasts.com/dto/base'
import Role from '#users/models/role'

export default class RoleDto extends BaseModelDto {
  declare id: number
  declare name: string
  declare description: string

  constructor(role?: Role) {
    super()

    if (!role) return

    this.id = role.id
    this.name = role.name
    this.description = role.description
  }
}
