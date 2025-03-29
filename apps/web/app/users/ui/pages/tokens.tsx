import { InferPageProps } from '@adonisjs/inertia/types'

import type TokensController from '#users/controllers/tokens_controller'

import AppLayout from '#common/ui/components/app_layout'
import HeadingSmall from '#common/ui/components/heading_small'

import SettingsLayout from '#users/ui/components/settings_layout'
import TokensTable from '#users/ui/components/tokens_table'
import { TokensDialogs } from '#users/ui/components/tokens_dialogs'
import TokensProvider from '#users/ui/context/tokens_context'
import { TokensPrimaryButtons } from '#users/ui/components/tokens_primary_buttons'

export default function TokensPage({ tokens }: InferPageProps<TokensController, 'index'>) {
  const currentPath = '/settings/tokens'

  return (
    <AppLayout breadcrumbs={[{ label: 'Tokens' }]}>
      <SettingsLayout currentPath={currentPath}>
        <TokensProvider>
          <div className="space-y-6">
            <HeadingSmall title="Tokens" description="Manage your API tokens here.">
              <TokensPrimaryButtons />
            </HeadingSmall>

            <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
              <TokensTable tokens={tokens} />
            </div>
          </div>

          <TokensDialogs />
        </TokensProvider>
      </SettingsLayout>
    </AppLayout>
  )
}
