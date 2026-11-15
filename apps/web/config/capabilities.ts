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
  [ROLES.ADMIN]: ['users.*', 'tokens.*'],
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
