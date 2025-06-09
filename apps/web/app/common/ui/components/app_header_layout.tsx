import React from 'react'

import { NavUser } from '#common/ui/components/nav_user'
import { AppLogo } from '#common/ui/components/app_logo'
import { NavHeaderMain } from '#common/ui/components/nav_header_main'
import { NavHeaderMobile } from '#common/ui/components/nav_header_mobile'
import { ToggleTheme } from '#common/ui/components/toggle_theme'
import Breadcrumb from '#common/ui/components/breadcrumbs'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

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

export default function AppHeaderLayout({
  children,
  breadcrumbs = [],
  navMain,
  navUser,
  user,
}: AppLayoutProps) {
  return (
    <>
      <div className="border-sidebar-border/80 border-b">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
          <NavHeaderMobile items={navMain} />

          <AppLogo />

          <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavHeaderMain items={navMain} />
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <div className="relative flex items-center space-x-1">
              <ToggleTheme />
              <NavUser user={user} options={navUser} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-sidebar-border/70 flex w-full border-b">
        <Breadcrumb breadcrumbs={breadcrumbs} />
      </div>

      <main className="mx-auto px-2 flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl">
        {children}
      </main>
    </>
  )
}
