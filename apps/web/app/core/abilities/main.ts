/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| The `hasPermission` ability bridges the role/permission catalog defined in
| `#users/enums/permission` with Bouncer. Register it on the middleware and
| call it as `bouncer.allows('hasPermission', PERMISSIONS.x)` for lightweight
| capability checks that don't need a full policy.
|
| Prefer policies (`bouncer.with(Policy).authorize(...)`) for gates that
| combine capability with ownership or state.
|
*/

import { Bouncer } from '@adonisjs/bouncer'

import type { Permission } from '#users/enums/permission'
import type User from '#users/models/user'

export const hasPermission = Bouncer.ability(async (user: User, permission: Permission) =>
  user.hasPermission(permission)
)
