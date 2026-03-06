import type { InertiaProps } from '#core/ui/types'

import AppLayout from '#common/ui/components/app_layout'
import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'

import { UsersDialogs } from '#users/ui/components/users_dialogs'
import { UsersPrimaryButtons } from '#users/ui/components/users_primary_buttons'
import UsersTable from '#users/ui/components/users_table'
import { userRoles } from '#users/ui/components/users_types'
import UsersProvider from '#users/ui/context/users_context'

import { useTranslation } from '#common/ui/hooks/use_translation'

import type { Data } from '@generated/data'

type PageProps = InertiaProps<{
  users: {
    data: Data.Users.User[]
    metadata: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl?: string
      lastPageUrl?: string
      nextPageUrl?: string | null
      previousPageUrl?: string | null
    }
  }
  q?: string
  selectedRoles: number[]
}>

export default function ListUsersPage({ users, q, selectedRoles }: PageProps) {
  const { t } = useTranslation()

  const roles = userRoles(t)

  return (
    <AppLayout breadcrumbs={[{ label: t('users.index.page.breadcrumbs.users') }]}>
      <UsersProvider>
        <Main>
          <Heading
            title={t('users.index.page.title')}
            description={t('users.index.page.description')}
          >
            <UsersPrimaryButtons />
          </Heading>

          <div className="flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
            <UsersTable users={users} roles={roles} q={q} selectedRoles={selectedRoles} />
          </div>
        </Main>

        <UsersDialogs roles={roles} />
      </UsersProvider>
    </AppLayout>
  )
}
