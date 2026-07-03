import { Exception } from '@adonisjs/core/exceptions'

export default class ManageRolesUnauthorizedException extends Exception {
  static status = 403
  static code = 'E_MANAGE_ROLES_UNAUTHORIZED'

  constructor() {
    super('You are not allowed to manage roles.')
  }
}
