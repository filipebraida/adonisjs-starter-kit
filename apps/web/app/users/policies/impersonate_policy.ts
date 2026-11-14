import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_USERS } from '#users/enums/capability'
import type User from '#users/models/user'

@inject()
export default class ImpersonatePolicy extends BasePolicy {
  constructor(private authz: Authorizer) {
    super()
  }

  async create(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return false
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersImpersonate)
  }
}
