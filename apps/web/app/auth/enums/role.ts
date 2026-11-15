export const ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

const ROLE_WEIGHTS: Record<Role, number> = {
  admin: 20,
  manager: 15,
  user: 10,
}

const KNOWN_ROLES = new Set<string>(Object.values(ROLES))

/** A role defined in code. Any other role is institutional, created on the roles page. */
export function isStructuralRole(role: string): role is Role {
  return KNOWN_ROLES.has(role)
}

/** Lowercase letters, digits and underscores, from a letter: the shape of every role name. */
export const ROLE_NAME_PATTERN = /^[a-z][a-z0-9_]*$/

export function mainRole(roles: string[]): Role | null {
  const known = roles.filter(isStructuralRole)
  if (known.length === 0) return null
  return known.reduce((top, role) => (ROLE_WEIGHTS[role] > ROLE_WEIGHTS[top] ? role : top))
}

/** The role to show for a user: the strongest structural one, else their first institutional one. */
export function displayRole(roles: string[]): string | null {
  return mainRole(roles) ?? [...roles].sort()[0] ?? null
}
