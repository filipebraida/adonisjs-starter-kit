import React from 'react'

import { ModalRoot } from 'adonis-inertia-modal/react'
import { Toaster } from '@workspace/ui/components/sonner'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'

import { AppSidebar } from '#core/ui/components/app_sidebar'
import Breadcrumb from '#core/ui/components/breadcrumbs'
import { NavUser } from '#core/ui/components/nav_user'
import { NotificationBell } from '#core/ui/components/notification_bell'
import { getCookie } from '#core/ui/hooks/cookie'

import useUser from '#core/ui/hooks/use_user'
import useFlashToasts from '#core/ui/hooks/use_flash_toasts'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { getAdminNav, getNavUser } from '#core/ui/app/navigation'
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
  const navUser = getNavUser(t)
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
                <SidebarTrigger className="-ml-1" />

                <Breadcrumb breadcrumbs={breadcrumbs} />
              </div>

              <div className="flex flex-row items-center gap-2 ml-auto">
                <NotificationBell />
                <NavUser user={user} options={navUser} />
              </div>
            </header>
            {/* A div: SidebarInset is already the page's <main>. */}
            <div className="flex flex-1 flex-col gap-4 py-4 px-6 overflow-y-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <ModalRoot />
    </>
  )
}
