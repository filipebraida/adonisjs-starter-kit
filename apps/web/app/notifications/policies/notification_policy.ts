import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Access to the signed-in user's own inbox: no capability gates it and guests
 * are denied. The queries and actions scope each read and write to the inbox
 * owner, so a foreign notification id 404s.
 */
export default class NotificationPolicy extends BasePolicy {
  /** Every signed-in user, on their own notifications. */
  viewList(): AuthorizerResponse {
    return true
  }

  /** Every signed-in user, marking their own notifications. */
  update(): AuthorizerResponse {
    return true
  }
}
