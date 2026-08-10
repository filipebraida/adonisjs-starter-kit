import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import i18nManager from '@adonisjs/i18n/services/main'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

import Notification from '#notifications/models/notification'
import User from '#users/models/user'
import { EMPTY_GLOBAL_PERMISSIONS, globalPermissions } from '#users/services/global_permissions'
import UserTransformer from '#users/transformers/user_transformer'

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

    let can = EMPTY_GLOBAL_PERMISSIONS
    let unseenNotifications = 0

    if (auth?.user) {
      const user = auth.user as User
      await User.preComputeUrls(user)
      await user.load('roles')

      can = await globalPermissions(user)

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
      can: ctx.inertia.always(can),
      unseenNotifications: ctx.inertia.always(unseenNotifications),
    }
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
