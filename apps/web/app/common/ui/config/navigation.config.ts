import type { SimpleTFunction } from '#common/ui/hooks/use_translation'

import { LogOut, Settings, Users } from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

export function getNavUser(t: SimpleTFunction): NavUserOptionsGroup[] {
  console.log('getNavUser called')
  return [
    [
      {
        title: t('common.layout.navUser.settings'),
        url: '/settings',
        icon: Settings,
      },
    ],
    [
      {
        title: t('common.layout.navUser.logout'),
        url: '/logout',
        icon: LogOut,
      },
    ],
  ]
}

export function getNavMain(t: SimpleTFunction): NavMainItem[] {
  console.log('getNavMain called')
  return [
    {
      title: t('common.layout.navMain.dashboard'),
      url: '/dashboard',
    },
    {
      title: t('common.layout.navMain.administration'),
      items: [
        {
          title: t('common.layout.navMain.users'),
          url: '/users',
          icon: Users,
          subject: 'users',
        },
      ],
    },
  ]
}
