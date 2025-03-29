import { ReactNode } from 'react'

import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'
import SidebarNav from '#common/ui/components/sidebar_nav'

import { Separator } from '@workspace/ui/components/separator'
import { KeyRound, Ticket, User } from 'lucide-react'

const sidebarNavItems = [
  {
    title: 'Profile',
    icon: <User size={18} />,
    href: '/settings/profile',
  },
  {
    title: 'Password',
    icon: <KeyRound size={18} />,
    href: '/settings/password',
  },
  {
    title: 'Tokens',
    icon: <Ticket size={18} />,
    href: '/settings/tokens',
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
            <SidebarNav items={sidebarNavItems} currentPath={currentPath} />
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
