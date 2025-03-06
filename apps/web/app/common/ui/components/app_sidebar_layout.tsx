import React from 'react'

import { ToggleTheme } from '#common/ui/components/toggle_theme'
import { NavUser, NavUserOptionsGroup } from '#common/ui/components/nav_user'
import { AppSidebar } from '#common/ui/components/app_sidebar'
import { NavMainItem } from '#common/ui/types/nav_main'
import Breadcrumb from '#common/ui/components/breadcrumbs'

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
    <SidebarProvider>
      <AppSidebar navMain={navMain} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />

          <Breadcrumb breadcrumbs={breadcrumbs} />

          <div className="flex flex-row items-center gap-2 ml-auto">
            <ToggleTheme />
            <NavUser user={user} options={navUser} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
