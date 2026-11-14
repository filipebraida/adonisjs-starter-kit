import type { HttpContext } from '@adonisjs/core/http'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import type User from '#auth/models/user'

const IMPERSONATION_KEY = 'impersonation'

/** Who started the impersonation and whom it targets, kept in the session. */
export interface ImpersonationMark {
  originalUserId: number
  targetUserId: number
}

/**
 * The live impersonation of this session, or null. A mark whose target is no
 * longer the signed-in user is stale (a later login replaced it) and is
 * dropped, so it never attributes someone else's actions to the old admin.
 */
export function currentImpersonation(
  session: HttpContext['session'],
  currentUserId: number | undefined
): ImpersonationMark | null {
  const mark = session.get(IMPERSONATION_KEY) as ImpersonationMark | undefined
  if (!mark) return null
  if (mark.targetUserId !== currentUserId) {
    session.forget(IMPERSONATION_KEY)
    return null
  }
  return mark
}

export interface ImpersonateUserInput {
  impersonated: User
  originalUserId: number
  session: HttpContext['session']
  auth: HttpContext['auth']
}

/**
 * Signs the session in as another user, marking who started it so the audit
 * trail attributes the actions to the admin.
 */
export default class ImpersonateUser {
  async handle(input: ImpersonateUserInput): Promise<void> {
    // Recorded before the login swaps the session, so the actor is still the admin.
    await input.impersonated.auditCustom(AUDIT_EVENTS.IMPERSONATION_STARTED, {
      metadata: { originalUserId: input.originalUserId },
    })

    const mark: ImpersonationMark = {
      originalUserId: input.originalUserId,
      targetUserId: input.impersonated.id,
    }
    input.session.put(IMPERSONATION_KEY, mark)
    await input.auth.use('web').login(input.impersonated)
  }
}
