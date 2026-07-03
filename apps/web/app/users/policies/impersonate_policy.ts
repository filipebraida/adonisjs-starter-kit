import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

import { PERMISSIONS } from '#users/enums/permission'
import type User from '#users/models/user'

export default class ImpersonatePolicy extends BasePolicy {
  async create(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return false
    return currentUser.hasPermission(PERMISSIONS.usersImpersonate)
  }
}
