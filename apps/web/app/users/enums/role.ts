export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

const ROLE_WEIGHTS: Record<Role, number> = {
  admin: 20,
  user: 10,
}

const KNOWN_ROLES = new Set<string>(Object.values(ROLES))

function isKnownRole(role: string): role is Role {
  return KNOWN_ROLES.has(role)
}

export function mainRole(roles: string[]): Role | null {
  const known = roles.filter(isKnownRole)
  if (known.length === 0) return null
  return known.reduce((top, role) => (ROLE_WEIGHTS[role] > ROLE_WEIGHTS[top] ? role : top))
}
