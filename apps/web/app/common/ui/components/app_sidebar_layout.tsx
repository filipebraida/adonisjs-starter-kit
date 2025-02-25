import React from 'react'

import useUser from '#auth/ui/hooks/use_user'
import { AppSidebar, NavMainSections } from '#common/ui/components/app_sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { Separator } from '@workspace/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { Toaster } from '@workspace/ui/components/toaster'

import { ModeToggle } from '#common/ui/components/mode_toggle'
import { NavUser, NavUserOptionsGroup } from '#common/ui/components/nav_user'

import AbilityProvider from '#users/ui/context/abilities_context'
import { LayoutGrid, LogOut, Settings, Users } from 'lucide-react'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
}

const navMain: NavMainSections = [
  {
    title: 'Plattaform',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: Users,
        subject: 'users',
      },
    ],
  },
]

export const navUser: NavUserOptionsGroup[] = [
  [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
  [
    {
      title: 'Log out',
      url: '/logout',
      icon: LogOut,
    },
  ],
]

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
  const user = useUser()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AbilityProvider>
        <Toaster />
        <SidebarProvider>
          <AppSidebar navMain={navMain} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <SidebarTrigger className="-ml-1" />
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1">
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {item.href ? (
                              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              )}
              <div className="flex flex-row items-center gap-2 ml-auto">
                <ModeToggle />
                <NavUser
                  user={{
                    name: user.fullName ?? undefined,
                    email: user.email,
                  }}
                  options={navUser}
                />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AbilityProvider>
    </ThemeProvider>
  )
}
