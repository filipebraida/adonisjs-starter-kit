import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

import Authorizer from '#core/authz/authorizer'

import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { ROLES } from '#auth/enums/role'
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
    if (!(await this.authz.can(currentUser, CAPABILITIES_USERS.usersUpdate))) return false
    return this.mayTouchRolesOf(currentUser, user)
  }

  async delete(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return false
    if (!(await this.authz.can(currentUser, CAPABILITIES_USERS.usersDelete))) return false
    return this.mayTouchRolesOf(currentUser, user)
  }

  /**
   * An account holding any role above user is reached only by who manages
   * roles: otherwise a manager could reset an admin's password and sign in as one.
   */
  private async mayTouchRolesOf(currentUser: User, user: User): Promise<boolean> {
    // The list preloads the roles; elsewhere they are read from the store.
    const roles = user.$preloaded.roles
      ? user.roles.map((role) => role.name)
      : await user.getRoles()
    if (roles.every((role) => role === ROLES.USER)) return true
    return this.authz.can(currentUser, CAPABILITIES_AUTH.usersManageRoles)
  }

  async viewActivity(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersAudit)
  }

  async manageRoles(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_AUTH.usersManageRoles)
  }

  async invite(currentUser: User): Promise<AuthorizerResponse> {
    return this.authz.can(currentUser, CAPABILITIES_USERS.usersInvite)
  }
}
