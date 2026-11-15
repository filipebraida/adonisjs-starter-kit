import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * No such space, article or picture, or one the reader may not read: the
 * same 404, so a hidden article's existence never shows.
 */
export default class HelpArticleNotFoundException extends Exception {
  static status = 404
  static code = 'E_HELP_ARTICLE_NOT_FOUND'

  constructor() {
    super('This help article does not exist or is not yours to read.')
  }

  async handle(error: this, ctx: HttpContext) {
    const message = ctx.i18n.t('help.errors.not_found')

    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return ctx.response.status(error.status).send({ errors: [{ message }] })
    }

    ctx.session.flash('error', message)
    ctx.response.redirect().withQs().back()
  }
}
