import React from 'react'

import { ToggleTheme } from '#common/ui/components/toggle_theme'
import { NavUser } from '#common/ui/components/nav_user'
import { AppSidebar } from '#common/ui/components/app_sidebar'
import Breadcrumb from '#common/ui/components/breadcrumbs'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'

import UserDto from '#users/dtos/user'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  navMain: NavMainItem[]
  navUser: NavUserOptionsGroup[]
  user: UserDto
}

export default function AppLayout({
  children,
  breadcrumbs = [],
  navMain,
  navUser,
  user,
}: AppLayoutProps) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar navMain={navMain} />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <div className="flex flex-row items-center gap-2">
            <SidebarTrigger className="-ml-1" />

            <Breadcrumb breadcrumbs={breadcrumbs} />
          </div>

          <div className="flex flex-row items-center gap-2 ml-auto">
            <ToggleTheme />
            <NavUser user={user} options={navUser} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
