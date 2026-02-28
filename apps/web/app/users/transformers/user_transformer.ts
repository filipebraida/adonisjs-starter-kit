import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#users/models/user'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    const user = this.resource
    const thumbnail = user.avatar?.getVariant('thumbnail')?.url

    return {
      id: user.id,
      roleId: user.roleId,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: thumbnail ? thumbnail : user.avatarUrl,
      createdAt: user.createdAt.toISO()!,
      updatedAt: user.updatedAt ? user.updatedAt.toISO()! : '',
    }
  }
}
