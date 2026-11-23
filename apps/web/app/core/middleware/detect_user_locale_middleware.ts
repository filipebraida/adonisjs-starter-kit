import { I18n } from '@adonisjs/i18n'
import i18nManager from '@adonisjs/i18n/services/main'
import type { NextFn } from '@adonisjs/core/types/http'
import { type HttpContext, RequestValidator } from '@adonisjs/core/http'

import { USER_LOCALE_COOKIE, setUserLocaleCookie } from '#core/utils/user_locale'

export default class DetectUserLocaleMiddleware {
  static {
    RequestValidator.messagesProvider = (ctx) => {
      return ctx.i18n.createMessagesProvider()
    }
  }

  protected getRequestLocale(ctx: HttpContext) {
    const supportedLocales = i18nManager.supportedLocales()

    const customHeaderLocale = ctx.request.header('X-User-Language')

    if (customHeaderLocale && supportedLocales.includes(customHeaderLocale)) {
      return customHeaderLocale
    }

    const cookieLocale = ctx.request.cookie(USER_LOCALE_COOKIE)

    if (cookieLocale && supportedLocales.includes(cookieLocale)) {
      return cookieLocale
    }

    const userLanguages = ctx.request.languages()

    return i18nManager.getSupportedLocaleFor(userLanguages) ?? i18nManager.defaultLocale
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const language = this.getRequestLocale(ctx)
    if (ctx.request.cookie(USER_LOCALE_COOKIE) !== language) {
      setUserLocaleCookie(ctx.response, language)
    }

    ctx.i18n = i18nManager.locale(language || i18nManager.defaultLocale)

    ctx.containerResolver.bindValue(I18n, ctx.i18n)

    if ('view' in ctx) {
      ctx.view.share({ i18n: ctx.i18n })
    }

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    i18n: I18n
  }
}
