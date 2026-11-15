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

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    /**
     * The share method is called everytime an Inertia page is rendered. In
     * certain cases, a page may get rendered before the session middleware
     * or the auth middleware are executed. For example: During a 404 request.
     *
     * In that case, we must always assume that HttpContext is not fully hydrated
     * with all the properties
     */
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
   * The flash bag is sent to every Inertia page as a top-level "flash" field
   * (a sibling of "props") and is read on the client using "usePage().flash".
   *
   * Just like the share method, the flash method may run before the session
   * middleware, so HttpContext must be treated as partially hydrated.
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
