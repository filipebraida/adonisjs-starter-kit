import { inject } from '@adonisjs/core'

import type User from '#auth/models/user'
import Authorizer from '#core/authz/authorizer'
import type { Capability } from '#core/authz/capability'
import HelpCatalog from '#help/services/help_catalog'
import type { HelpAccess, HelpSpace } from '#help/types/help'

/**
 * The capabilities the help's indexes cite that the reader holds, each asked
 * once. It is the cut of everything in the
 * help: the navigation, the previous and next, a direct visit and the pictures.
 */
@inject()
export default class ResolveHelpAccess {
  constructor(
    private authorizer: Authorizer,
    private catalog: HelpCatalog
  ) {}

  /** `spaces`, when the caller already loaded them, spares reading the catalog again. */
  async handle(user: User, spaces?: HelpSpace[]): Promise<HelpAccess> {
    const cited = spaces ? HelpCatalog.capabilitiesOf(spaces) : await this.catalog.capabilities()
    const held = await Promise.all(
      cited.map(async (capability) =>
        (await this.authorizer.can(user, capability as Capability)) ? capability : null
      )
    )
    return new Set(held.filter((capability) => capability !== null))
  }
}
