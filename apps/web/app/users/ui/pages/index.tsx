import { InferPageProps } from '@adonisjs/inertia/types'

import type UsersController from '#users/controllers/users_controller'

import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import Heading from '#common/ui/components/heading'

import UsersTable from '#users/ui/components/users_table'
import { UsersPrimaryButtons } from '#users/ui/components/users_primary_buttons'
import { UsersDialogs } from '#users/ui/components/users_dialogs'
import UsersProvider from '#users/ui/context/users_context'
import { userRoles } from '#users/ui/components/users_types'

import { useTranslation } from '#common/ui/hooks/use_translation'

export default function ListUsersPage({
  users,
  q,
  selectedRoles,
}: InferPageProps<UsersController, 'index'>) {
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
