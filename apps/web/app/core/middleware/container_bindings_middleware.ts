import { Logger } from '@adonisjs/core/logger'
import { HttpContext } from '@adonisjs/core/http'
import { type NextFn } from '@adonisjs/core/types/http'

import { PermissionCache } from '@adonis-agora/authz'
import authz from '@adonis-agora/authz/services/main'

/**
 * The container bindings middleware binds classes to their request
 * specific value using the container resolver.
 *
 * - We bind "HttpContext" class to the "ctx" object
 * - And bind "Logger" class to the "ctx.logger" object
 * - And bind "PermissionCache" to one snapshot per request, so every policy
 *   of the request decides against the same authz state
 */
export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.containerResolver.bindValue(HttpContext, ctx)
    ctx.containerResolver.bindValue(Logger, ctx.logger)
    ctx.containerResolver.bindValue(PermissionCache, await authz.createCache())

    return next()
  }
}
