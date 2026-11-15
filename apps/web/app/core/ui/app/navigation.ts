import type { TFunction } from '#core/ui/hooks/use_translation'

import {
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#core/ui/app/navigation_types'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { CAPABILITIES_USERS } from '#users/enums/capability'

export function getNavUser(t: TFunction): NavUserOptionsGroup[] {
  return [
    [
      {
        title: t('core.layout.navUser.settings'),
        url: '/settings',
        icon: Settings,
      },
      {
        title: t('core.layout.navUser.help'),
        url: '/help',
        icon: BookOpen,
      },
      {
        title: t('core.layout.navUser.adminPanel'),
        url: '/users',
        icon: Shield,
        can: CAPABILITIES_USERS.usersViewList,
      },
    ],
    [
      {
        title: t('core.layout.navUser.logout'),
        url: '/logout',
        icon: LogOut,
        method: 'post',
      },
    ],
  ]
}

export function getMainNav(t: TFunction): NavMainItem[] {
  return [
    {
      title: t('core.layout.navMain.dashboard'),
      url: '/dashboard',
    },
  ]
}

export function getAdminNav(t: TFunction): NavMainItem[] {
  return [
    {
      title: t('core.layout.navMain.dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('core.layout.navMain.administration'),
      items: [
        {
          title: t('core.layout.navMain.users'),
          url: '/users',
          icon: Users,
          can: CAPABILITIES_USERS.usersViewList,
        },
        {
          title: t('core.layout.navMain.activity'),
          url: '/users/activity',
          icon: History,
          can: CAPABILITIES_USERS.usersAudit,
        },
        {
          title: t('core.layout.navMain.roles'),
          url: '/roles',
          icon: ShieldCheck,
          can: CAPABILITIES_AUTH.usersManageRoles,
        },
      ],
    },
  ]
}
