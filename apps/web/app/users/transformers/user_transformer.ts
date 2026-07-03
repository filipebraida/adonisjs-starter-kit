import { BaseTransformer } from '@adonisjs/core/transformers'

import type User from '#users/models/user'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName,
      email: this.resource.email,
    }
  }

  forSharedProps() {
    return {
      ...this.toObject(),
      avatarUrl: this.avatarUrl(),
    }
  }

  forList() {
    return {
      ...this.toObject(),
      roles: this.roleNames(),
      createdAt: this.resource.createdAt.toISO()!,
    }
  }

  forEdit() {
    return {
      ...this.toObject(),
      roles: this.roleNames(),
    }
  }

  forProfile() {
    return {
      ...this.toObject(),
      avatarUrl: this.avatarUrl(),
    }
  }

  private avatarUrl() {
    const thumbnail = this.resource.avatar?.getVariant('thumbnail')?.url
    return thumbnail ?? this.resource.avatarUrl
  }

  private roleNames() {
    return this.resource.preloadedRoles.map((role) => role.name)
  }
}
