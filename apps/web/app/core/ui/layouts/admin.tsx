import React from 'react'

import { ModalRoot } from 'adonis-inertia-modal/react'
import { useAuthz } from '@adonis-agora/authz-react'
import { Toaster } from '@workspace/ui/components/sonner'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'

import { AppSidebar } from '#core/ui/components/app_sidebar'
import Breadcrumb from '#core/ui/components/breadcrumbs'
import { NavUser } from '#core/ui/components/nav_user'
import { NotificationBell } from '#core/ui/components/notification_bell'
import { TabBar } from '#core/ui/components/tab_bar'
import { getCookie } from '#core/ui/hooks/cookie'

import useUser from '#core/ui/hooks/use_user'
import useFlashToasts from '#core/ui/hooks/use_flash_toasts'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { getAdminNav, getNavUser, getTabs, userRoleLabel } from '#core/ui/app/navigation'
import { ImpersonationBanner } from '#core/ui/components/impersonation_banner'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AdminLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
}

const EMPTY_BREADCRUMBS: BreadcrumbItemProps[] = []

export default function AdminLayout({
  children,
  breadcrumbs = EMPTY_BREADCRUMBS,
}: AdminLayoutProps) {
  const user = useUser()
  const { t } = useTranslation()
  const navMain = getAdminNav(t)
  const navUser = getNavUser(t, 'admin')
  const { roles } = useAuthz()
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  useFlashToasts()

  if (!user) {
    return null
  }

  return (
    <>
      <Toaster />
      <div className="flex h-svh flex-col">
        <ImpersonationBanner />
        {/* contain-layout makes the provider the containing block of the fixed sidebar, which would otherwise cover the banner. */}
        <SidebarProvider
          defaultOpen={defaultOpen}
          className="min-h-0 flex-1 overflow-hidden contain-layout"
        >
          <AppSidebar navMain={navMain} variant="inset" collapsible="icon" />
          <SidebarInset className="overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <div className="flex flex-row items-center gap-2">
                {/* On a phone the tab bar takes the sidebar's place. */}
                <SidebarTrigger
                  className="-ml-1 hidden md:inline-flex"
                  label={t('core.layout.sidebar.toggle')}
                />

                <Breadcrumb breadcrumbs={breadcrumbs} />
              </div>

              <div className="flex flex-row items-center gap-2 ml-auto">
                <NotificationBell />
                <NavUser user={user} role={userRoleLabel(t, roles)} options={navUser} />
              </div>
            </header>
            {/* A div: SidebarInset is already the page's <main>. */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pt-4 pb-24 md:pb-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <div className="md:hidden">
          <TabBar items={getTabs(t, 'admin')} area="admin" />
        </div>
      </div>
      <ModalRoot />
    </>
  )
}
