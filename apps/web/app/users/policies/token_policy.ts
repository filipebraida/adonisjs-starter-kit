import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_USERS } from '#users/enums/capability'
import type User from '#users/models/user'

@inject()
export default class TokenPolicy extends BasePolicy {
  constructor(private authz: Authorizer) {
    super()
  }

  async create(user: User): Promise<AuthorizerResponse> {
    return this.authz.can(user, CAPABILITIES_USERS.tokensCreate)
  }

  async viewList(user: User): Promise<AuthorizerResponse> {
    return this.authz.can(user, CAPABILITIES_USERS.tokensViewList)
  }

  async delete(user: User): Promise<AuthorizerResponse> {
    return this.authz.can(user, CAPABILITIES_USERS.tokensDelete)
  }
}
