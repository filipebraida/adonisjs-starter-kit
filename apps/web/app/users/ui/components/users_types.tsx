import { LucideIcon, Shield, Tag, User } from 'lucide-react'

import { TFunction } from '#core/ui/hooks/use_translation'

import { isStructuralRole, ROLES } from '#auth/enums/role'

export type Role = {
  label: string
  value: string
  icon?: LucideIcon
}

/** A role's display name: translated for roles in code, the name itself for institutional ones. */
export function roleLabel(t: TFunction, role: string): string {
  return isStructuralRole(role) ? t(`users.roles.${role}.name`) : role
}

/** The assignable roles: the ones in code, strongest first, then the institutional ones. */
export function userRoles(t: TFunction, institutional: string[] = []): Role[] {
  return [
    { value: ROLES.ADMIN, label: roleLabel(t, ROLES.ADMIN), icon: Shield },
    { value: ROLES.USER, label: roleLabel(t, ROLES.USER), icon: User },
    ...institutional.map((role) => ({ value: role, label: role, icon: Tag })),
  ]
}
