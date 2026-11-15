import type { HttpContext } from '@adonisjs/core/http'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { IMPERSONATION_SESSION_KEY, type ImpersonationMark } from '#auth/enums/impersonation'
import type User from '#auth/models/user'

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
    input.session.put(IMPERSONATION_SESSION_KEY, mark)
    await input.auth.use('web').login(input.impersonated)
  }
}
