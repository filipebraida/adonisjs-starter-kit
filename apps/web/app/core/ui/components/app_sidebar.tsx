import React from 'react'

import { NavSidebarMain } from '#core/ui/components/nav_sidebar_main'
import { AppLogo } from '#core/ui/components/app_logo'

import type { NavMainItem } from '#core/ui/types/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navMain: NavMainItem[]
}

export function AppSidebar({ navMain, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <AppLogo />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSidebarMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
