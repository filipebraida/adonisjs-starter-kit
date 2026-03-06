import type { InertiaProps } from '#core/ui/types'
import type { Data } from '@generated/data'

import AppLayout from '#common/ui/components/app_layout'
import HeadingSmall from '#common/ui/components/heading_small'

import SettingsLayout from '#users/ui/components/settings_layout'
import { TokensDialogs } from '#users/ui/components/tokens_dialogs'
import { TokensPrimaryButtons } from '#users/ui/components/tokens_primary_buttons'
import TokensTable from '#users/ui/components/tokens_table'
import TokensProvider from '#users/ui/context/tokens_context'

import { useTranslation } from '#common/ui/hooks/use_translation'

type PageProps = InertiaProps<{ tokens: Data.Users.Token[] }>

export default function TokensPage({ tokens }: PageProps) {
  const { t } = useTranslation()
  const currentPath = '/settings/tokens'

  return (
    <AppLayout breadcrumbs={[{ label: t('users.tokens.breadcrumbs.settings') }]}>
      <SettingsLayout currentPath={currentPath}>
        <TokensProvider>
          <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-4xl space-y-6">
              <HeadingSmall
                title={t('users.tokens.title')}
                description={t('users.tokens.description')}
              >
                <TokensPrimaryButtons />
              </HeadingSmall>

              <div className="flex-1 overflow-auto py-1">
                <TokensTable tokens={tokens} />
              </div>
            </div>
          </div>

          <TokensDialogs />
        </TokensProvider>
      </SettingsLayout>
    </AppLayout>
  )
}
