import { Exception } from '@adonisjs/core/exceptions'

export default class AdminLockoutException extends Exception {
  static status = 403
  static code = 'E_ADMIN_LOCKOUT'

  constructor() {
    super('You cannot remove your own administrator role.')
  }
}
