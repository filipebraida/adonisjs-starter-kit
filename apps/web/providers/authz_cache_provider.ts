import type { ApplicationService } from '@adonisjs/core/types'

import { AuthzService, PermissionCache } from '@adonis-agora/authz'

/**
 * Container fallback for `PermissionCache`.
 *
 * Inside HTTP the request's cache is bound by `ContainerBindingsMiddleware`,
 * so every policy of one request shares one read. Outside HTTP (a unit spec
 * resolving a policy, a job, an ace command) there is no request resolver,
 * and the container could not build the cache at all.
 *
 * `bind`, not `singleton`, on purpose: a cache is a snapshot that never
 * invalidates, so sharing one across resolutions would freeze authorization
 * for the whole process.
 */
export default class AuthzCacheProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.bind(PermissionCache, async (resolver) => {
      const authz = await resolver.make(AuthzService)
      return authz.createCache()
    })
  }
}
