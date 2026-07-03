export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_WEIGHTS: Record<Role, number> = {
  admin: 20,
  user: 10,
}

const KNOWN_ROLES = new Set<string>(Object.values(ROLES))

function isKnownRole(role: string): role is Role {
  return KNOWN_ROLES.has(role)
}

/** The highest-weight role held by a user, or null if none are known. */
export function mainRole(roles: string[]): Role | null {
  const known = roles.filter(isKnownRole)
  if (known.length === 0) return null
  return known.reduce((top, role) => (ROLE_WEIGHTS[role] > ROLE_WEIGHTS[top] ? role : top))
}

/** True when the user has any role other than the base `user`. */
export function isStaff(roles: string[]): boolean {
  return roles.some((role) => role !== ROLES.USER)
}

/** True when the user has no roles assigned — a signal they need onboarding. */
export function needsOnboarding(roles: string[]): boolean {
  return roles.length === 0
}
