/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| `can` and `hasRole` consult @adonis-agora/authz (wildcards included):
| `bouncer.allows('can', CAPABILITIES_USERS.usersInvite)` for a capability
| check that needs no policy.
|
| Prefer policies (`bouncer.with(Policy).authorize(...)`) for gates that
| combine a capability with ownership or state.
|
*/

import { defineAuthzAbilities } from '@adonis-agora/authz'

export const { can, hasRole } = defineAuthzAbilities()
