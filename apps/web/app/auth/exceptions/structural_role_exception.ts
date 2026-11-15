import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** A role defined in code: its capabilities live in `config/capabilities.ts`, not on the roles page. */
export default class StructuralRoleException extends Exception {
  static status = 422
  static code = 'E_STRUCTURAL_ROLE'

  constructor() {
    super('A role defined in code cannot be created, edited or deleted here.')
  }

  async handle(error: this, ctx: HttpContext) {
    const message = ctx.i18n.t('errors.E_STRUCTURAL_ROLE')

    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return ctx.response.status(error.status).send({ errors: [{ message }] })
    }

    ctx.session.flash('error', message)
    ctx.response.redirect().back()
  }
}
