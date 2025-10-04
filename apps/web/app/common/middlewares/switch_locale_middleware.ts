import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SwitchLocaleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    ctx.response.cookie('user-locale', ctx.params.locale, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // Example duration: 30 days
      sameSite: true, // Improve cookie security
    })

    ctx.response.redirect().back()

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()

    return output
  }
}
