import React from 'react'

import { ModalRoot } from 'adonis-inertia-modal/react'
import { useAuthz } from '@adonis-agora/authz-react'
import { Toaster } from '@workspace/ui/components/sonner'

import { AppLogo } from '#core/ui/components/app_logo'
import Breadcrumb from '#core/ui/components/breadcrumbs'
import { NavHeaderMain } from '#core/ui/components/nav_header_main'
import { NavUser } from '#core/ui/components/nav_user'
import { NotificationBell } from '#core/ui/components/notification_bell'
import { TabBar } from '#core/ui/components/tab_bar'

import usePageProps from '#core/ui/hooks/use_page_props'
import useUser from '#core/ui/hooks/use_user'
import useFlashToasts from '#core/ui/hooks/use_flash_toasts'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { getMainNav, getNavUser, getTabs, userRoleLabel } from '#core/ui/app/navigation'
import { ImpersonationBanner } from '#core/ui/components/impersonation_banner'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AuthenticatedLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
}

const EMPTY_BREADCRUMBS: BreadcrumbItemProps[] = []

export default function AuthenticatedLayout({
  children,
  breadcrumbs = EMPTY_BREADCRUMBS,
}: AuthenticatedLayoutProps) {
  const user = useUser()
  const { unseenNotifications } = usePageProps<{ unseenNotifications: number }>()
  const { t } = useTranslation()
  const navMain = getMainNav(t)
  const navUser = getNavUser(t, 'app')
  const { roles } = useAuthz()

  useFlashToasts()

  if (!user) {
    return null
  }

  return (
    <>
      <Toaster />
      <div className="h-svh flex flex-col overflow-hidden">
        <ImpersonationBanner />
        <div className="border-sidebar-border/80 border-b shrink-0">
          <div className="mx-auto flex h-16 items-center px-6 max-w-7xl">
            <AppLogo />

            <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
              <NavHeaderMain items={navMain} />
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <div className="relative flex items-center space-x-1">
                <NotificationBell />
                <NavUser user={user} role={userRoleLabel(t, roles)} options={navUser} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="border-sidebar-border/70 flex w-full border-b shrink-0">
            <div className="mx-auto flex h-12 w-full items-center justify-start px-6 max-w-7xl">
              <Breadcrumb breadcrumbs={breadcrumbs} />
            </div>
          </div>

          {/* On a phone the tab bar covers the foot of the page: the content stops above it. */}
          <main className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 px-6 pb-24 lg:pb-0">
            {children}
          </main>
        </div>
        <div className="lg:hidden">
          <TabBar items={getTabs(t, 'app', { unseenNotifications })} area="app" />
        </div>
      </div>
      <ModalRoot />
    </>
  )
}
