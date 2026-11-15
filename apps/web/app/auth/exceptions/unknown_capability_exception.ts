import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** A capability outside the vocabulary: a grant no screen would show. */
export default class UnknownCapabilityException extends Exception {
  static status = 422
  static code = 'E_UNKNOWN_CAPABILITY'

  constructor(public capability: string) {
    super(`Unknown capability "${capability}".`)
  }

  async handle(error: this, ctx: HttpContext) {
    const message = ctx.i18n.t('errors.E_UNKNOWN_CAPABILITY', { capability: error.capability })

    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return ctx.response.status(error.status).send({ errors: [{ message }] })
    }

    ctx.session.flash('error', message)
    ctx.response.redirect().back()
  }
}
