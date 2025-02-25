import Roles from '#users/enums/role'
import { Shield, User } from 'lucide-react'

export const userRoles = [
  {
    id: Roles.ADMIN,
    icon: Shield,
  },
  {
    id: Roles.USER,
    icon: User,
  },
] as const
