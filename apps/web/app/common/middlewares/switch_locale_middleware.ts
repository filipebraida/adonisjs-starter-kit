import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import i18nManager from '@adonisjs/i18n/services/main'

import { setUserLocaleCookie } from '#common/services/user_locale'

export default class SwitchLocaleMiddleware {
  async handle(ctx: HttpContext, _next: NextFn) {
    const locale = ctx.params.locale

    if (!i18nManager.supportedLocales().includes(locale)) {
      return ctx.response.redirect().back()
    }

    setUserLocaleCookie(ctx.response, locale)

    try {
      const user = await ctx.auth.use('web').authenticate()
      user.locale = locale
      await user.save()
    } catch {
      // Anonymous request — cookie fallback is enough.
    }

    return ctx.response.redirect().back()
  }
}
