import { urlFor } from '@adonisjs/core/services/url_builder'

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

import { afterAuthRedirectRoute } from '#config/auth'

export default class GuestMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    for (let guard of options.guards || [ctx.auth.defaultGuard]) {
      if (await ctx.auth.use(guard).check()) {
        const redirectTo = urlFor(afterAuthRedirectRoute)

        return ctx.response.redirect(redirectTo, true)
      }
    }

    return next()
  }
}
