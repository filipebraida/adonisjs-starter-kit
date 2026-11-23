import { BaseTransformer } from '@adonisjs/core/transformers'

import type User from '#auth/models/user'

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
    return this.resource.avatarThumbnailUrl ?? this.resource.avatarUrl
  }

  /** Needs `roles` preloaded (`ListUsers`, the edit controller). */
  private roleNames() {
    return this.resource.roles.map((role) => role.name)
  }
}
