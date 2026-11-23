import type { TFunction } from '#core/ui/hooks/use_translation'

import { isStructuralRole } from '#auth/enums/role'

/** A role's name for the screen: translated for the roles in code, the name itself for institutional ones. */
export function roleName(t: TFunction, role: string): string {
  return isStructuralRole(role) ? t(`auth.role_names.${role}.name`) : role
}

/** What a role in code is for; institutional roles have no description. */
export function roleDescription(t: TFunction, role: string): string | null {
  return isStructuralRole(role) ? t(`auth.role_names.${role}.description`) : null
}

/**
 * A capability as a sentence ("Invite users"); a wildcard grant (`users.*`)
 * reads as its whole domain, shown under the domain's name. A slug with no
 * label shows itself.
 */
export function capabilityLabel(t: TFunction, capability: string): string {
  if (capability.endsWith('.*')) return t('auth.roles.whole_domain')
  return t(`auth.capabilities.${capability}`, { defaultValue: capability })
}

/** The domain a capability belongs to (the prefix before the dot), named for the screen. */
export function domainLabel(t: TFunction, domain: string): string {
  return t(`auth.capability_domains.${domain}`, { defaultValue: domain })
}

/** Capabilities grouped by domain, in the order they come: one reasons about them by domain. */
export function byDomain(capabilities: string[]): [string, string[]][] {
  const groups = new Map<string, string[]>()
  for (const capability of capabilities) {
    const domain = capability.split('.')[0]
    groups.set(domain, [...(groups.get(domain) ?? []), capability])
  }
  return [...groups.entries()]
}
