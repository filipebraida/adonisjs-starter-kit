import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { ROLES, type Role } from '#auth/enums/role'
import { CAPABILITIES_USERS } from '#users/enums/capability'

/**
 * Every role's capabilities, in one place. Each module declares its own
 * capabilities in `<mod>/enums/capability.ts`; this file only grants them.
 * A wildcard such as `users.*` is a grant shortcut; checks always name one
 * capability.
 */
const roleGrants: Record<Role, string[]> = {
  // Everything, including roles, impersonation and the activity trail.
  [ROLES.ADMIN]: ['users.*', 'tokens.*'],
  // Runs the user list: create, invite, edit and delete accounts that hold no
  // role above user. No roles page, no impersonation, no activity trail.
  [ROLES.MANAGER]: [
    CAPABILITIES_USERS.usersViewList,
    CAPABILITIES_USERS.usersCreate,
    CAPABILITIES_USERS.usersInvite,
    CAPABILITIES_USERS.usersUpdate,
    CAPABILITIES_USERS.usersDelete,
  ],
  // No admin screen.
  [ROLES.USER]: [],
}

/**
 * Every capability an institutional role may be given on the roles page. A
 * module's capabilities join here when it declares them.
 */
const vocabulary: string[] = [
  ...Object.values(CAPABILITIES_AUTH),
  ...Object.values(CAPABILITIES_USERS),
].sort()

export default { roleGrants, vocabulary }
