import { I18n } from '@adonisjs/i18n'
import i18nManager from '@adonisjs/i18n/services/main'
import type { NextFn } from '@adonisjs/core/types/http'
import { type HttpContext, RequestValidator } from '@adonisjs/core/http'

/**
 * The "DetectUserLocaleMiddleware" middleware uses i18n service to share
 * a request specific i18n object with the HTTP Context
 */
export default class DetectUserLocaleMiddleware {
  /**
   * Using i18n for validation messages. Applicable to only
   * "request.validateUsing" method calls
   */
  static {
    RequestValidator.messagesProvider = (ctx) => {
      return ctx.i18n.createMessagesProvider()
    }
  }

  /**
   * This method reads the user language from the "Accept-Language"
   * header and returns the best matching locale by checking it
   * against the supported locales.
   *
   * Feel free to use different mechanism for finding user language.
   */
  protected getRequestLocale(ctx: HttpContext) {
    // Retrieve supported languages
    const supportedLocales = i18nManager.supportedLocales()

    // First, try to read the language from a custom header
    const customHeaderLocale = ctx.request.header('X-User-Language')

    // If the custom header exists and is a valid locale, use it
    if (customHeaderLocale && supportedLocales.includes(customHeaderLocale)) {
      return customHeaderLocale
    }

    // Then check the cookie
    const cookieLocale = ctx.request.cookie('user-locale')

    if (cookieLocale && supportedLocales.includes(cookieLocale)) {
      return cookieLocale
    }

    // Fallback to the Accept-Language header if no valid custom header or cookie
    const userLanguages = ctx.request.languages()

    return i18nManager.getSupportedLocaleFor(userLanguages) ?? i18nManager.defaultLocale
  }

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Finding user language
     */
    const language = this.getRequestLocale(ctx)
    // Update the cookie if necessary
    if (!ctx.request.cookie('user-locale') || ctx.request.cookie('user-locale') !== language) {
      ctx.response.cookie('user-locale', language, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // Example duration: 30 days
        sameSite: true, // Improve cookie security
      })
    }

    /**
     * Assigning i18n property to the HTTP context
     */
    ctx.i18n = i18nManager.locale(language || i18nManager.defaultLocale)

    /**
     * Binding I18n class to the request specific instance of it.
     * Doing so will allow IoC container to resolve an instance
     * of request specific i18n object when I18n class is
     * injected somewhere.
     */
    ctx.containerResolver.bindValue(I18n, ctx.i18n)

    /**
     * Sharing request specific instance of i18n with edge
     * templates.
     *
     * Remove the following block of code, if you are not using
     * edge templates.
     */
    if ('view' in ctx) {
      ctx.view.share({ i18n: ctx.i18n })
    }

    return next()
  }
}

/**
 * Notify TypeScript about i18n property
 */
declare module '@adonisjs/core/http' {
  export interface HttpContext {
    i18n: I18n
  }
}
