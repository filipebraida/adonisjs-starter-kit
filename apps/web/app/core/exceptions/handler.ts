import { errors as authErrors } from '@adonisjs/auth'
import { errors } from '@adonisjs/bouncer'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = app.inProduction

  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    // The error stays out of the props: the pages do not read it, and it would
    // carry the stack and the internal message to the browser.
    '404': (_, { inertia }) => inertia.render('core/errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('core/errors/server_error', {}),
  }

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof errors.E_AUTHORIZATION_FAILURE) {
      const message = ctx.i18n?.t('errors.E_AUTHORIZATION_FAILURE') ?? error.message
      if (ctx.request.accepts(['html', 'json']) === 'json') {
        return ctx.response.status(403).send({ message })
      }
      ctx.session?.flash('error', message)
      return ctx.response.redirect().back()
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      const message = ctx.i18n?.t('errors.E_INVALID_CREDENTIALS') ?? error.message
      if (ctx.request.accepts(['html', 'json']) === 'json') {
        return ctx.response.status(401).send({ message })
      }
      ctx.session?.flash('error', message)
      return ctx.response.redirect().toRoute('auth.sign_in.show')
    }

    return super.handle(error, ctx)
  }

  /** Never send a response from here. */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
