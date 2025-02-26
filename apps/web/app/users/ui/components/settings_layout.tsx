import { ReactNode } from 'react'
import { Link } from '@inertiajs/react'

import Heading from '#common/ui/components/heading'

import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@workspace/ui/lib/utils'
import { Main } from '#common/ui/components/main'

type NavItem = {
  title: string
  url: string
  icon: React.ReactNode | null
}

const sidebarNavItems: NavItem[] = [
  {
    title: 'Profile',
    url: '/settings/profile',
    icon: null,
  },
  {
    title: 'Password',
    url: '/settings/password',
    icon: null,
  },
]

export default function SettingsLayout({
  children,
  currentPath,
}: {
  children: ReactNode
  currentPath: string
}) {
  return (
    <Main>
      <Heading title="Settings" description="Manage your profile and account settings" />

      <Separator className="my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-y-1 space-x-0">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.url}
                size="sm"
                variant="ghost"
                asChild
                className={cn('w-full justify-start', {
                  'bg-muted': currentPath === item.url,
                })}
              >
                <Link href={item.url} prefetch>
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="my-6 md:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </Main>
  )
}
