import { Head, Link } from '@inertiajs/react'
import { useAuthz } from '@adonis-agora/authz-react'
import { ChevronRight } from 'lucide-react'

import { getMoreGroups, userRoleLabel } from '#core/ui/app/navigation'
import type { ShellArea } from '#core/ui/app/navigation_types'
import type { InertiaProps } from '#core/ui/app/types'
import AdminLayout from '#core/ui/layouts/admin'
import AuthenticatedLayout from '#core/ui/layouts/authenticated'
import { Main } from '#core/ui/components/main'
import { UserAvatar } from '#core/ui/components/user_avatar'
import useAllows from '#core/ui/hooks/use_allows'
import { useTranslation } from '#core/ui/hooks/use_translation'
import useUser from '#core/ui/hooks/use_user'

type PageProps = InertiaProps<{ area: ShellArea }>

const ITEM =
  'flex h-14 w-full items-center gap-3 px-4 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'

/**
 * The phone's "More" page: who is signed in, and everything the tab bar does
 * not show, grouped as the sidebar and the user menu group it. On a wide
 * screen nobody lands here, but the page works: the same navigation, as a list.
 */
export default function MorePage({ area }: PageProps) {
  const { t } = useTranslation()
  const allows = useAllows()
  const user = useUser()
  const { roles } = useAuthz()
  const Layout = area === 'admin' ? AdminLayout : AuthenticatedLayout
  const role = userRoleLabel(t, roles)
  const groups = getMoreGroups(t, area)
    .map((group) => ({ ...group, items: group.items.filter((item) => allows(item.can)) }))
    .filter((group) => group.items.length > 0)

  if (!user) return null

  return (
    <Layout breadcrumbs={[{ label: t('core.layout.more.title') }]}>
      <Head title={t('core.layout.more.title')} />
      <Main size="column" className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <UserAvatar user={user} className="size-11" />
          <div className="min-w-0">
            <div className="truncate font-semibold">{user.fullName ?? user.email}</div>
            <div className="truncate text-xs text-muted-foreground">
              {role ? `${role} · ${user.email}` : user.email}
            </div>
          </div>
        </div>

        {groups.map((group) => (
          <section key={group.title} className="space-y-2">
            <h2 className="px-1 text-xs font-medium text-muted-foreground">{group.title}</h2>
            <ul className="list-none divide-y overflow-hidden rounded-xl border bg-card p-0">
              {group.items.map(({ title, url, icon: Icon, method, external }) => {
                const content = (
                  <>
                    {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
                    <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
                    {!method && (
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                    )}
                  </>
                )

                return (
                  <li key={url}>
                    {/* A screen outside Inertia (the workflows console) opens as another page. */}
                    {external ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className={ITEM}>
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={url}
                        method={method ?? 'get'}
                        as={method === 'post' ? 'button' : 'a'}
                        className={ITEM}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </Main>
    </Layout>
  )
}
