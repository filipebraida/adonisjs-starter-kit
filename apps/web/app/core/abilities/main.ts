/*
 * `can` and `hasRole` consult @adonis-agora/authz (wildcards included):
 * `bouncer.allows('can', CAPABILITIES_USERS.usersInvite)` for a capability
 * check that needs no policy. A gate that combines a capability with
 * ownership or state goes in a policy.
 */

import { defineAuthzAbilities } from '@adonis-agora/authz'

export const { can, hasRole } = defineAuthzAbilities()
