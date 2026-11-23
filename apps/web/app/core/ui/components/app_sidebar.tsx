import React from 'react'

import { NavSidebarMain } from '#core/ui/components/nav_sidebar_main'
import { AppLogo } from '#core/ui/components/app_logo'
import { useTranslation } from '#core/ui/hooks/use_translation'

import type { NavMainItem } from '#core/ui/app/navigation_types'

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
  const { t } = useTranslation()

  return (
    <Sidebar
      mobileTitle={t('core.layout.sidebar.title')}
      mobileDescription={t('core.layout.sidebar.description')}
      {...props}
    >
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
