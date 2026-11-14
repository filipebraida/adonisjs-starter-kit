import type { SimpleTFunction } from '#core/ui/hooks/use_translation'

import { LayoutDashboard, LogOut, Settings, Shield, Users } from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#core/ui/types/navigation'
import { CAPABILITIES_USERS } from '#users/enums/capability'

export function getNavUser(t: SimpleTFunction): NavUserOptionsGroup[] {
  return [
    [
      {
        title: t('core.layout.navUser.settings'),
        url: '/settings',
        icon: Settings,
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

export function getMainNav(t: SimpleTFunction): NavMainItem[] {
  return [
    {
      title: t('core.layout.navMain.dashboard'),
      url: '/dashboard',
    },
  ]
}

export function getAdminNav(t: SimpleTFunction): NavMainItem[] {
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
      ],
    },
  ]
}
