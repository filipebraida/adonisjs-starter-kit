import { BaseTransformer } from '@adonisjs/core/transformers'
import type Role from '#users/models/role'

export default class RoleTransformer extends BaseTransformer<Role> {
  toObject() {
    const role = this.resource

    return {
      id: role.id,
      name: role.name,
      description: role.description,
    }
  }
}
