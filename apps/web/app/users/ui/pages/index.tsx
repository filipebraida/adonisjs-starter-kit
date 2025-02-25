import { InferPageProps } from '@adonisjs/inertia/types'

import AppLayout from '#common/ui/components/app_sidebar_layout'
import { Main } from '#common/ui/components/main'

import UsersTable from '../components/users_table'
import { UsersPrimaryButtons } from '../components/users_primary_buttons'
import { UsersDialogs } from '../components/users_dialogs'
import UsersProvider from '../context/users_context'

import type UsersController from '#users/controllers/users_controller'
import Heading from '#common/ui/components/heading'

export default function ListUsersPage({ users, roles }: InferPageProps<UsersController, 'index'>) {
  return (
    <AppLayout breadcrumbs={[{ label: 'Users' }]}>
      <UsersProvider>
        <Main>
          <Heading title="User List" description="Manage your users and their roles here.">
            <UsersPrimaryButtons />
          </Heading>
          <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
            <UsersTable users={users} roles={roles} />
          </div>
        </Main>

        <UsersDialogs roles={roles} />
      </UsersProvider>
    </AppLayout>
  )
}
