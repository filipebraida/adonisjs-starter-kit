import { ROLES, type Role } from '#users/enums/role'

/**
 * Every role's capabilities, in one place. Each module declares its own
 * capabilities in `<mod>/enums/capability.ts`; this file only grants them.
 * A wildcard such as `users.*` is a grant shortcut — checks always name one
 * capability.
 */
const roleGrants: Record<Role, string[]> = {
  [ROLES.ADMIN]: ['users.*', 'tokens.*'],
  [ROLES.USER]: [],
}

export default { roleGrants }
