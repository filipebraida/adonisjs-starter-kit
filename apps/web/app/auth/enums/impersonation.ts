import type { HttpContext } from '@adonisjs/core/http'

/** Session key of the impersonation mark: who started it and whom it targets. */
export const IMPERSONATION_SESSION_KEY = 'impersonation'

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
  const mark = session.get(IMPERSONATION_SESSION_KEY) as ImpersonationMark | undefined
  if (!mark) return null
  if (mark.targetUserId !== currentUserId) {
    session.forget(IMPERSONATION_SESSION_KEY)
    return null
  }
  return mark
}
