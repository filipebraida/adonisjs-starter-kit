import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_USERS } from '#users/enums/capability'
import type User from '#auth/models/user'
import type { ImpersonationMark } from '#auth/enums/impersonation'

@inject()
export default class ImpersonatePolicy extends BasePolicy {
  constructor(private authz: Authorizer) {
    super()
  }

  /**
   * No impersonation starts inside another: the mark holds one admin, and a new
   * one would erase who is behind the session.
   */
  async create(
    currentUser: User,
    user: User,
    mark: ImpersonationMark | null
  ): Promise<AuthorizerResponse> {
    if (mark !== null) return false
    if (currentUser.id === user.id) return false
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersImpersonate)
  }

  /** Only a session impersonating the signed-in user switches back, to the admin who started it. */
  async stop(currentUser: User, mark: ImpersonationMark | null): Promise<AuthorizerResponse> {
    return mark !== null && mark.targetUserId === currentUser.id
  }
}
