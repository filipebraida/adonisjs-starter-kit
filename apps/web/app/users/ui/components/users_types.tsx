import { LucideIcon, Shield, Tag, User, UserCog } from 'lucide-react'

import { TFunction } from '#core/ui/hooks/use_translation'

import { isStructuralRole, ROLES } from '#auth/enums/role'

export type Role = {
  label: string
  value: string
  icon?: LucideIcon
}

/** A role's display name: translated for roles in code, the name itself for institutional ones. */
export function roleLabel(t: TFunction, role: string): string {
  return isStructuralRole(role) ? t(`auth.role_names.${role}.name`) : role
}

/**
 * The assignable roles: the built-in ones, strongest first, then the institutional
 * ones. Without `users.manage_roles` only `user` can be granted (the server refuses the rest).
 */
export function userRoles(
  t: TFunction,
  institutional: string[] = [],
  canManageRoles = true
): Role[] {
  const all = [
    { value: ROLES.ADMIN, label: roleLabel(t, ROLES.ADMIN), icon: Shield },
    { value: ROLES.MANAGER, label: roleLabel(t, ROLES.MANAGER), icon: UserCog },
    { value: ROLES.USER, label: roleLabel(t, ROLES.USER), icon: User },
    ...institutional.map((role) => ({ value: role, label: role, icon: Tag })),
  ]
  return canManageRoles ? all : all.filter((role) => role.value === ROLES.USER)
}

/** What the users screen lets the signed-in user do, decided by the policies in the controller. */
export type UsersPagePermissions = {
  can: { create: boolean; invite: boolean; viewActivity: boolean }
  rowCan: Record<number, { update: boolean; delete: boolean; impersonate: boolean }>
}
