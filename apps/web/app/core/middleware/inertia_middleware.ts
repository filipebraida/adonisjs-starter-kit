import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import i18nManager from '@adonisjs/i18n/services/main'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

import authz from '@adonis-agora/authz/services/main'
import { buildAuthzShare } from '@adonis-agora/authz-react/server'

import Notification from '#notifications/models/notification'
import User from '#auth/models/user'
import UserTransformer from '#users/transformers/user_transformer'
import { currentImpersonation } from '#auth/enums/impersonation'
import ListReadableHelpArticles from '#help/queries/list_readable_help_articles'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    // A page may render before the session and auth middleware (on a 404), so
    // the HttpContext may be only partly filled.
    const { auth } = ctx as Partial<HttpContext>

    // Reads through the library's request cache, the one the policies' checks share.
    const authzShare = await buildAuthzShare(authz, auth?.user ?? null)

    let unseenNotifications = 0

    if (auth?.user) {
      const user = auth.user as User
      await User.preComputeUrls(user)

      const row = await Notification.query()
        .where('notifiableId', String(user.id))
        .whereNull('seenAt')
        .count('* as total')
        .first()
      unseenNotifications = Number(row?.$extras.total ?? 0)
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      user: ctx.inertia.always(
        auth?.user ? UserTransformer.transform(auth.user).useVariant('forSharedProps') : undefined
      ),
      locale: ctx.inertia.always(ctx.i18n?.locale ?? i18nManager.config.defaultLocale),
      fallbackLocale: ctx.inertia.always(ctx.i18n?.fallbackLocale ?? 'en'),
      csrf: ctx.inertia.always(ctx.request.csrfToken),
      // Spread: `always` needs an index signature, which the interface lacks.
      authz: ctx.inertia.always({ ...authzShare }),
      unseenNotifications: ctx.inertia.always(unseenNotifications),
      impersonation: ctx.inertia.always(await this.impersonation(ctx)),
      // What a screen's "?" may open. Resolved on every full page visit, skipped
      // by partial reloads. A broken help index (a typo in an index.json) is
      // logged and hides every "?", rather than failing every screen of the app.
      helpArticles: async (): Promise<string[]> => {
        if (!auth?.user) return []
        try {
          const articles = await ctx.containerResolver.make(ListReadableHelpArticles)
          return await articles.handle(auth.user as User)
        } catch (error) {
          ctx.logger.error({ err: error }, 'the help could not be read')
          return []
        }
      },
    }
  }

  /** Whom the impersonating admin switches back to, for the banner; null when nobody is impersonating. */
  private async impersonation(ctx: HttpContext): Promise<{ returnTo: string } | null> {
    const { session, auth } = ctx as Partial<HttpContext>
    const mark = session ? currentImpersonation(session, auth?.user?.id) : null
    if (!mark) return null

    const admin = await User.find(mark.originalUserId)
    return admin ? { returnTo: admin.fullName ?? admin.email } : null
  }

  /**
   * Sent as the top-level `flash` field, read on the client with `usePage().flash`.
   * Like `share`, it may run before the session middleware.
   */
  flash(ctx: HttpContext) {
    const { session } = ctx as Partial<HttpContext>

    return {
      error: session?.flashMessages.get('error') as string | undefined,
      success: session?.flashMessages.get('success') as string | undefined,
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
