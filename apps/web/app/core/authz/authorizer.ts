import { inject } from '@adonisjs/core'

import { AuthzService, PermissionCache } from '@adonis-agora/authz'

import type { Capability } from '#core/authz/capability'

/**
 * The capability check policies and actions run, sharing the request's
 * permission cache so several checks cost one read. Outside a request the
 * cache is fresh per resolution.
 */
@inject()
export default class Authorizer {
  constructor(
    private authz: AuthzService,
    private cache: PermissionCache
  ) {}

  can(user: unknown, capability: Capability): Promise<boolean> {
    return this.authz.can(user, capability, { cache: this.cache })
  }
}
