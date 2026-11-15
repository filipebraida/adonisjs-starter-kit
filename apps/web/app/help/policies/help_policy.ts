import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * The help opens to every signed-in person. The cut is per article: the
 * catalog hides one whose capability the reader lacks (`ResolveHelpAccess`).
 */
export default class HelpPolicy extends BasePolicy {
  /** Every signed-in user. */
  view(): AuthorizerResponse {
    return true
  }
}
