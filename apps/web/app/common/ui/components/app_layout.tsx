import React from 'react'

import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'
import AppHeaderLayout from '#common/ui/components/app_header_layout'

import useUser from '#auth/ui/hooks/use_user'
import AbilityProvider from '#users/ui/context/abilities_context'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { Toaster } from '@workspace/ui/components/sonner'

import { getNavMain, getNavUser } from '#common/ui/config/navigation.config'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  layout?: 'sidebar' | 'header'
}

export default function AppLayout({
  children,
  breadcrumbs = [],
  layout = 'header',
}: AppLayoutProps) {
  const user = useUser()

  const { t } = useTranslation()

  const navMain = getNavMain(t)
  const navUser = getNavUser(t)

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
