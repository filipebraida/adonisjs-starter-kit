import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** Someone still holds the role. Removing it from each user first leaves every removal in the audit trail. */
export default class RoleHasMembersException extends Exception {
  static status = 422
  static code = 'E_ROLE_HAS_MEMBERS'

  constructor(public total: number) {
    super(`The role is still held by ${total} user(s).`)
  }

  async handle(error: this, ctx: HttpContext) {
    const message = ctx.i18n.t('errors.E_ROLE_HAS_MEMBERS', { total: error.total })

    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return ctx.response.status(error.status).send({ errors: [{ message }] })
    }

    ctx.session.flash('error', message)
    ctx.response.redirect().back()
  }
}
