import type { HttpContext } from '@adonisjs/core/http'

export const USER_LOCALE_COOKIE = 'user-locale'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function setUserLocaleCookie(response: HttpContext['response'], locale: string) {
  response.cookie(USER_LOCALE_COOKIE, locale, {
    httpOnly: true,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: true,
  })
}
