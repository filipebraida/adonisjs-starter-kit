import { ReactNode } from 'react'

import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'
import SidebarNav, { type SidebarNavItem } from '#common/ui/components/sidebar_nav'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { Separator } from '@workspace/ui/components/separator'
import { KeyRound, Ticket, User } from 'lucide-react'

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
  ]
  return (
    <Main>
      <Heading title={t('users.layout.title')} description={t('users.layout.description')} />

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
