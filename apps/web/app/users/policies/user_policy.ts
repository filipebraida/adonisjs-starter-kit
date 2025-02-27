import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#users/models/user'

export default class UserPolicy extends BasePolicy {
  viewList(currentUser: User): AuthorizerResponse {
    return currentUser.isAdmin
  }

  view(currentUser: User, user: User): AuthorizerResponse {
    return currentUser.isAdmin || currentUser.id === user.id
  }

  create(currentUser: User): AuthorizerResponse {
    return currentUser.isAdmin
  }

  update(currentUser: User, user: User): AuthorizerResponse {
    return currentUser.isAdmin || currentUser.id === user.id
  }

  delete(currentUser: User, user: User): AuthorizerResponse {
    return currentUser.isAdmin && currentUser.id !== user.id
  }

  invite(currentUser: User): AuthorizerResponse {
    return currentUser.isAdmin
  }
}
