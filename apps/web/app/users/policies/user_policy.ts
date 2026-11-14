import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_USERS } from '#users/enums/capability'
import type User from '#auth/models/user'

@inject()
export default class UserPolicy extends BasePolicy {
  constructor(private authz: Authorizer) {
    super()
  }

  async viewList(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersViewList)
  }

  async view(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return true
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersViewList)
  }

  async create(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersCreate)
  }

  async update(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return true
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersUpdate)
  }

  async delete(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return false
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersDelete)
  }

  async invite(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersInvite)
  }
}
