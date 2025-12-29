import { ReactNode } from 'react'

import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'
import SidebarNav, { type SidebarNavItem } from '#common/ui/components/sidebar_nav'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { Separator } from '@workspace/ui/components/separator'
import { KeyRound, Palette, Ticket, User } from 'lucide-react'

export default function SettingsLayout({
  children,
  currentPath,
}: {
  children: ReactNode
  currentPath: string
}) {
  const { t } = useTranslation()
  const sidebarNavItems: SidebarNavItem[] = [
    {
      title: t('users.layout.profile'),
      icon: <User size={18} />,
      href: '/settings/profile',
    },
    {
      title: t('users.layout.password'),
      icon: <KeyRound size={18} />,
      href: '/settings/password',
    },
    {
      title: t('users.layout.tokens'),
      icon: <Ticket size={18} />,
      href: '/settings/tokens',
      subject: 'token',
    },
    {
      title: 'Appearance',
      icon: <Palette size={18} />,
      href: '/settings/appearance',
    },
  ]
  return (
    <Main fixed className="h-full flex flex-col space-y-0 p-0">
      <div className="flex-none p-4 pb-2 lg:p-6 lg:pb-2">
        <Heading title={t('users.layout.title')} description={t('users.layout.description')} />
        <Separator className="mt-6" />
      </div>

      <div className="flex flex-1 w-full flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="w-full px-4 lg:px-6 max-w-xl lg:w-48">
          <nav className="flex flex-col space-y-1">
            <SidebarNav items={sidebarNavItems} currentPath={currentPath} />
          </nav>
        </aside>

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </Main>
  )
}
