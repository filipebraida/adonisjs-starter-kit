import React from 'react'

import { NavUserOptionsGroup } from '#common/ui/components/nav_user'
import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'
import AppHeaderLayout from '#common/ui/components/app_header_layout'
import { NavMainItem } from '#common/ui/types/nav_main'

import useUser from '#auth/ui/hooks/use_user'
import AbilityProvider from '#users/ui/context/abilities_context'

import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { Toaster } from '@workspace/ui/components/toaster'
import { LayoutGrid, LogOut, Settings, Users } from 'lucide-react'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  layout?: 'sidebar' | 'header'
}

const navMain: NavMainItem[] = [
  {
    title: 'oi',
    url: '/oi',
    icon: LayoutGrid,
  },
  {
    title: 'Plattaform',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
      },
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
      },
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: Users,
        subject: 'users',
      },
    ],
  },
]

export const navUser: NavUserOptionsGroup[] = [
  [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
  [
    {
      title: 'Log out',
      url: '/logout',
      icon: LogOut,
    },
  ],
]

export default function AppLayout({
  children,
  breadcrumbs = [],
  layout = 'header',
}: AppLayoutProps) {
  const user = useUser()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AbilityProvider>
        <Toaster />

        {layout === 'header' ? (
          <AppHeaderLayout
            user={user}
            navMain={navMain}
            navUser={navUser}
            breadcrumbs={breadcrumbs}
          >
            {children}
          </AppHeaderLayout>
        ) : (
          <AppSidebarLayout
            user={user}
            navMain={navMain}
            navUser={navUser}
            breadcrumbs={breadcrumbs}
          >
            {children}
          </AppSidebarLayout>
        )}
      </AbilityProvider>
    </ThemeProvider>
  )
}
