import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

import type UserDto from '#users/dtos/user'
import User from '#users/models/user'
import AbilitiesService from '#users/services/abilities_service'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const { session, auth } = ctx as Partial<HttpContext>

    let userDto: UserDto | undefined
    let abilities: Awaited<ReturnType<AbilitiesService['getAllAbilities']>> = []

    if (auth?.user) {
      const user = auth.user
      await User.preComputeUrls(user)

      abilities = await new AbilitiesService().getAllAbilities(user)
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: session?.flashMessages.get('error'),
        success: session?.flashMessages.get('success'),
      }),
      flashMessages: ctx.inertia.always(session?.flashMessages.all()),
      csrf: ctx.inertia.always(ctx.request.csrfToken),
      user: ctx.inertia.always(userDto ? userDto : {}),
      abilities: ctx.inertia.always(abilities),
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
