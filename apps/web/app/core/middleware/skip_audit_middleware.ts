import auditing from '@filipebraida/adonis-auditing/services/main'

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Silences auditing for a whole request — for high-volume routes with no
 * forensic value. A business event that must still be recorded inside one
 * escapes with `auditing.withAuditing(...)`.
 */
export default class SkipAuditMiddleware {
  async handle(_ctx: HttpContext, next: NextFn) {
    return auditing.withoutAuditing(() => next())
  }
}
