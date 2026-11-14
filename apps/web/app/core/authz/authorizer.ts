import { inject } from '@adonisjs/core'

import { AuthzService } from '@adonis-agora/authz'

import type { Capability } from '#core/authz/capability'

/**
 * The capability check policies and actions run, typed by `Capability` so a
 * misspelled slug fails to compile. Inside a request every check shares the
 * library's request cache (AsyncLocalStorage is on), so several checks cost
 * one read; outside a request each check reads the store.
 */
@inject()
export default class Authorizer {
  constructor(private authz: AuthzService) {}

  can(user: unknown, capability: Capability): Promise<boolean> {
    return this.authz.can(user, capability)
  }
}
