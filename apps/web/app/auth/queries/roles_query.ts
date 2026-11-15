import config from '@adonisjs/core/services/config'

import authz from '@adonis-agora/authz/services/main'

import { isStructuralRole, type Role } from '#auth/enums/role'

// Read from the composition root, the one place that knows every module's capabilities.
function roleGrants() {
  return config.get<Record<Role, string[]>>('capabilities.roleGrants')
}

/** Every capability an institutional role may be given. */
export function capabilityVocabulary(): string[] {
  return config.get<string[]>('capabilities.vocabulary')
}

/** The roles created on the roles page, without the ones defined in code. */
export async function institutionalRoles(): Promise<string[]> {
  const stored = await authz.store.listRoles()
  return stored.filter((role) => !isStructuralRole(role)).sort()
}

/** Every role that exists: the ones in code, then the institutional ones. */
export async function existingRoles(): Promise<string[]> {
  return [...Object.keys(roleGrants()), ...(await institutionalRoles())]
}

/** Whether a role can be assigned: defined in code or created on the roles page. */
export async function roleExists(role: string): Promise<boolean> {
  if (isStructuralRole(role)) return true
  const stored = await authz.store.listRoles()
  return stored.includes(role)
}

/** The capabilities of each role: the grants in code plus the ones stored for it. */
export async function capabilitiesOfRoles(roles: string[]): Promise<Record<string, string[]>> {
  const stored = await authz.store.getPermissionsForRoles(roles)
  const grants = roleGrants()
  return Object.fromEntries(
    roles.map((role) => {
      const inCode = isStructuralRole(role) ? grants[role] : []
      return [role, [...new Set([...inCode, ...(stored[role] ?? [])])].sort()]
    })
  )
}

/** How many users hold each role; a role nobody holds counts zero. */
export async function membersPerRole(roles: string[]): Promise<Record<string, number>> {
  const counts = await authz.store.countSubjectsByRole()
  return Object.fromEntries(roles.map((role) => [role, counts[role] ?? 0]))
}
