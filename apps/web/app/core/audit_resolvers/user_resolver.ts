import { type HttpContext } from '@adonisjs/core/http'
import type { UserResolver } from '@filipebraida/adonis-auditing/types'

/**
 * The actor of an audit row: whoever is signed in. Under impersonation that
 * is the target; the `impersonated_by` resolver records the admin behind it.
 */
export default class AuditUserResolver implements UserResolver {
  async resolve(ctx: HttpContext) {
    const user = (ctx as Partial<HttpContext>).auth?.user
    if (!user) return null
    return { type: 'user', id: String(user.id) }
  }
}
