import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/** The phone's "More" page; each of its items is filtered by its own capability. */
export default class MorePolicy extends BasePolicy {
  /** Every signed-in user. */
  view(): AuthorizerResponse {
    return true
  }
}
