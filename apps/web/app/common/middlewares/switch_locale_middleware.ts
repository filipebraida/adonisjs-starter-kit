import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import i18nManager from '@adonisjs/i18n/services/main'

export default class SwitchLocaleMiddleware {
  async handle(ctx: HttpContext, _next: NextFn) {
    const locale = ctx.params.locale

    if (!i18nManager.supportedLocales().includes(locale)) {
      return ctx.response.redirect().back()
    }

    ctx.response.cookie('user-locale', locale, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: true,
    })

    return ctx.response.redirect().back()
  }
}
