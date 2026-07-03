import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

import { PERMISSIONS } from '#users/enums/permission'
import type User from '#users/models/user'

export default class TokenPolicy extends BasePolicy {
  async create(user: User): Promise<AuthorizerResponse> {
    return user.hasPermission(PERMISSIONS.tokensCreate)
  }

  async viewList(user: User): Promise<AuthorizerResponse> {
    return user.hasPermission(PERMISSIONS.tokensViewList)
  }

  async delete(user: User): Promise<AuthorizerResponse> {
    return user.hasPermission(PERMISSIONS.tokensDelete)
  }
}
