import { LucideIcon, Shield, User } from 'lucide-react'

import { SimpleTFunction } from '#common/ui/hooks/use_translation'

import { ROLES, type Role as RoleSlug } from '#users/enums/role'

export type Role = {
  label: string
  value: RoleSlug
  icon?: LucideIcon
}

export function userRoles(t: SimpleTFunction): Role[] {
  return [
    {
      value: ROLES.ADMIN,
      label: t(`users.roles.${ROLES.ADMIN}.name`),
      icon: Shield,
    },
    {
      value: ROLES.USER,
      label: t(`users.roles.${ROLES.USER}.name`),
      icon: User,
    },
  ]
}
