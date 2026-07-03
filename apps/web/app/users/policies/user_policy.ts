import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

import { PERMISSIONS } from '#users/enums/permission'
import type User from '#users/models/user'

export default class UserPolicy extends BasePolicy {
  async viewList(currentUser: User): Promise<AuthorizerResponse> {
    return currentUser.hasPermission(PERMISSIONS.usersViewList)
  }

  async view(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return true
    return currentUser.hasPermission(PERMISSIONS.usersViewList)
  }

  async create(currentUser: User): Promise<AuthorizerResponse> {
    return currentUser.hasPermission(PERMISSIONS.usersCreate)
  }

  async update(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return true
    return currentUser.hasPermission(PERMISSIONS.usersUpdate)
  }

  async delete(currentUser: User, user: User): Promise<AuthorizerResponse> {
    if (currentUser.id === user.id) return false
    return currentUser.hasPermission(PERMISSIONS.usersDelete)
  }

  async invite(currentUser: User): Promise<AuthorizerResponse> {
    return currentUser.hasPermission(PERMISSIONS.usersInvite)
  }
}
