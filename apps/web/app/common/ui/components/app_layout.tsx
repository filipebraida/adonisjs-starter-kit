import React from 'react'

import { DirectionProvider } from '#common/ui/context/direction_provider'
import { LayoutProvider, useLayout } from '#common/ui/context/layout_provider'

import AppHeaderLayout from '#common/ui/components/app_header_layout'
import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'

import useUser from '#auth/ui/hooks/use_user'
import { useTranslation } from '#common/ui/hooks/use_translation'
import AbilityProvider from '#users/ui/context/abilities_context'

import { Toaster } from '@workspace/ui/components/sonner'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'

import { getNavMain, getNavUser } from '#common/ui/config/navigation.config'
import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

import type { Data } from '@generated/data'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  layout?: 'sidebar' | 'header'
  navMain?: NavMainItem[]
  navUser?: NavUserOptionsGroup[]
  user?: Data.Users.User
}

function AppLayoutContent({ children, breadcrumbs = [], navMain, navUser, user }: AppLayoutProps) {
  const { layout, variant, collapsible } = useLayout()

  if (!navMain || !navUser || !user) {
    return null
  }

  return (
    <>
      <Toaster />
      {layout === 'header' ? (
        <AppHeaderLayout user={user} navMain={navMain} navUser={navUser} breadcrumbs={breadcrumbs}>
          {children}
        </AppHeaderLayout>
      ) : (
        <AppSidebarLayout
          user={user}
          navMain={navMain}
          navUser={navUser}
          breadcrumbs={breadcrumbs}
          variant={variant}
          collapsible={collapsible}
        >
          {children}
        </AppSidebarLayout>
      )}
    </>
  )
}

export default function AppLayout(props: AppLayoutProps) {
  const user = useUser()
  const { t } = useTranslation()
  const navMain = getNavMain(t)
  const navUser = getNavUser(t)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DirectionProvider>
        <LayoutProvider>
          <AbilityProvider>
            <AppLayoutContent {...props} navMain={navMain} navUser={navUser} user={user} />
          </AbilityProvider>
        </LayoutProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
