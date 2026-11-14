import { BasePolicy } from '@adonisjs/bouncer'
import { type AuthorizerResponse } from '@adonisjs/bouncer/types'

/** Access to the analytics dashboard: no capability gates it and guests are denied. */
export default class DashboardPolicy extends BasePolicy {
  /** Every signed-in user. */
  view(): AuthorizerResponse {
    return true
  }
}
