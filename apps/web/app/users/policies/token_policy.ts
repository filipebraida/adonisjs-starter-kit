import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import User from '#users/models/user'

export default class TokenPolicy extends BasePolicy {
  create(user: User): AuthorizerResponse {
    return user.isAdmin
  }

  viewList(user: User): AuthorizerResponse {
    return user.isAdmin
  }
}
