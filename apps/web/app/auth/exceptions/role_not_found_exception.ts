import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** The role is neither defined in code nor created on the roles page. */
export default class RoleNotFoundException extends Exception {
  static status = 404
  static code = 'E_ROLE_NOT_FOUND'

  constructor(public role: string) {
    super(`Role "${role}" does not exist.`)
  }

  async handle(error: this, ctx: HttpContext) {
    const message = ctx.i18n.t('errors.E_ROLE_NOT_FOUND', { role: error.role })

    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return ctx.response.status(error.status).send({ errors: [{ message }] })
    }

    ctx.session.flash('error', message)
    ctx.response.redirect().back()
  }
}
