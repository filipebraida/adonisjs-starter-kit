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
  Workflow,
} from 'lucide-react'

import type {
  MoreGroup,
  NavMainItem,
  NavUserOptionsGroup,
  ShellArea,
  TabItem,
} from '#core/ui/app/navigation_types'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { displayRole } from '#auth/enums/role'
import { CAPABILITIES_USERS } from '#users/enums/capability'
import { roleLabel } from '#users/ui/components/users_types'

/** The user menu of a shell: inside the admin area it offers the way back instead of the admin panel. */
export function getNavUser(t: TFunction, area: ShellArea): NavUserOptionsGroup[] {
  const crossing =
    area === 'admin'
      ? { title: t('core.layout.navUser.backToApp'), url: '/dashboard', icon: LayoutDashboard }
      : {
          title: t('core.layout.navUser.adminPanel'),
          url: '/users',
          icon: Shield,
          can: CAPABILITIES_USERS.usersViewList,
        }

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
      crossing,
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

// The dashboard renders in the other shell, so the admin sidebar leaves it out: the user menu
// holds the way back.
export function getAdminNav(t: TFunction): NavMainItem[] {
  return [
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
        {
          title: t('core.layout.navMain.workflows'),
          // The console belongs to the workflows library, outside Inertia: it opens as another page.
          url: '/workflows',
          icon: Workflow,
          can: CAPABILITIES_AUTH.workflowsView,
          external: true,
        },
      ],
    },
  ]
}

/** The signed-in user's role, named for the screen: the strongest built-in one, else an institutional one. */
export function userRoleLabel(t: TFunction, roles: string[]): string | null {
  const role = displayRole(roles)
  return role ? roleLabel(t, role) : null
}

/** The phone's tab bar: the everyday destinations, within reach of the thumb; "More" holds the rest. */
export function getTabs(t: TFunction, area: ShellArea): TabItem[] {
  if (area === 'admin') {
    return [
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
    ]
  }

  return [
    { title: t('core.layout.navMain.dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('core.layout.navUser.help'), url: '/help', icon: BookOpen },
  ]
}

/** The phone's "More" page: what the tab bar leaves out, grouped as the sidebar and the user menu group it. */
export function getMoreGroups(t: TFunction, area: ShellArea): MoreGroup[] {
  const tabs = new Set(getTabs(t, area).map((tab) => tab.url))
  const rest = (area === 'admin' ? getAdminNav(t) : getMainNav(t)).flatMap((item) =>
    'items' in item
      ? [{ title: item.title, items: item.items.filter((sub) => !tabs.has(sub.url)) }]
      : tabs.has(item.url)
        ? []
        : [{ title: item.title, items: [item] }]
  )
  const account = getNavUser(t, area)
    .flat()
    .filter((option) => !tabs.has(option.url))

  return [
    ...rest.filter((group) => group.items.length > 0),
    { title: t('core.layout.more.account'), items: account },
  ]
}
