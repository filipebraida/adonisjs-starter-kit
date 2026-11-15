import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import type User from '#auth/models/user'

/** The roles page. It takes the capability to assign roles: whoever grants roles already decides privilege. */
@inject()
export default class RolePolicy extends BasePolicy {
  constructor(private authz: Authorizer) {
    super()
  }

  async viewList(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_AUTH.usersManageRoles)
  }

  async manage(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_AUTH.usersManageRoles)
  }
}
