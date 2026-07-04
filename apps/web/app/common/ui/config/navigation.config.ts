import type { SimpleTFunction } from '#common/ui/hooks/use_translation'

import { LayoutDashboard, LogOut, Settings, Shield, Users } from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

export function getNavUser(t: SimpleTFunction): NavUserOptionsGroup[] {
  return [
    [
      {
        title: t('common.layout.navUser.settings'),
        url: '/settings',
        icon: Settings,
      },
      {
        title: t('common.layout.navUser.adminPanel'),
        url: '/users',
        icon: Shield,
        can: 'manageUsers',
      },
    ],
    [
      {
        title: t('common.layout.navUser.logout'),
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
      title: t('common.layout.navMain.dashboard'),
      url: '/dashboard',
    },
  ]
}

export function getAdminNav(t: SimpleTFunction): NavMainItem[] {
  return [
    {
      title: t('common.layout.navMain.dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('common.layout.navMain.administration'),
      items: [
        {
          title: t('common.layout.navMain.users'),
          url: '/users',
          icon: Users,
          can: 'manageUsers',
        },
      ],
    },
  ]
}
