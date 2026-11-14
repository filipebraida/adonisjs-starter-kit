import { type HttpContext } from '@adonisjs/core/http'
import type { Resolver } from '@filipebraida/adonis-auditing/types'

import { currentImpersonation } from '#users/actions/impersonate_user'

/**
 * Under impersonation the audit's `user_id` is the target; without this key
 * the admin acting behind it would vanish from the trail. `undefined` (not
 * `null`) outside impersonation, so the key only appears when someone is there.
 */
export default class ImpersonatedByResolver implements Resolver {
  async resolve(ctx: HttpContext) {
    const { session, auth } = ctx as Partial<HttpContext>
    const mark = session ? currentImpersonation(session, auth?.user?.id) : null

    return mark ? String(mark.originalUserId) : undefined
  }
}
