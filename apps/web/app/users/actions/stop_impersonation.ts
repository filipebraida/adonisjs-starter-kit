import type { HttpContext } from '@adonisjs/core/http'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { currentImpersonation, IMPERSONATION_SESSION_KEY } from '#auth/enums/impersonation'
import User from '#auth/models/user'

export interface StopImpersonationInput {
  session: HttpContext['session']
  auth: HttpContext['auth']
}

/**
 * Signs the session back in as the admin who started the impersonation.
 * Returns that admin, or null when the session is not impersonating.
 */
export default class StopImpersonation {
  async handle({ session, auth }: StopImpersonationInput): Promise<User | null> {
    const target = auth.user
    const mark = currentImpersonation(session, target?.id)
    if (!target || !mark) return null

    // Recorded before the login swaps the session, so the row names both the target and the admin.
    await target.auditCustom(AUDIT_EVENTS.IMPERSONATION_STOPPED, {
      metadata: { originalUserId: mark.originalUserId },
    })

    const admin = await User.findOrFail(mark.originalUserId)
    session.forget(IMPERSONATION_SESSION_KEY)
    await auth.use('web').login(admin)

    return admin
  }
}
