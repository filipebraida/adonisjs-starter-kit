import { Head } from '@inertiajs/react'
import type { InertiaProps } from '#core/ui/app/types'
import type { Data } from '@generated/data'

import AuthenticatedLayout from '#core/ui/components/authenticated_layout'
import Heading from '#core/ui/components/heading'
import { Main } from '#core/ui/components/main'
import { HelpLink } from '#help/ui/components/help/help_link'
import { AppearanceForm } from '#users/ui/components/appearance_form'
import { PasswordSection, ProfileSection } from '#users/ui/components/account_sections'
import { SettingsSection } from '#users/ui/components/settings_section'
import { TokensSection } from '#users/ui/components/tokens_section'

import { useCan } from '@adonis-agora/authz-react'

import { CAPABILITIES_USERS } from '#users/enums/capability'
import { useTranslation } from '#core/ui/hooks/use_translation'

type PageProps = InertiaProps<{
  profile: Data.Users.User.Variants['forProfile']
  tokens: Data.Users.Token[]
  newToken: { name: string; value: string } | null
}>

export default function SettingsPage({ profile, tokens, newToken }: PageProps) {
  const { t } = useTranslation()
  const canManageTokens = useCan(CAPABILITIES_USERS.tokensViewList)

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('users.layout.title') }]}>
      <Head title={t('users.layout.title')} />
      <Main size="column">
        <Heading title={t('users.layout.title')} description={t('users.layout.description')} />

        <SettingsSection
          title={t('users.profile.title')}
          help={<HelpLink anchor="users.settings_profile" />}
          description={t('users.profile.description')}
        >
          <ProfileSection user={profile} />
        </SettingsSection>

        <SettingsSection
          title={t('users.password.title')}
          help={<HelpLink anchor="users.settings_password" />}
          description={t('users.password.description')}
        >
          <PasswordSection />
        </SettingsSection>

        <SettingsSection
          title={t('users.appearance.title')}
          help={<HelpLink anchor="users.settings_appearance" />}
          description={t('users.appearance.description')}
          last={!canManageTokens}
        >
          <AppearanceForm />
        </SettingsSection>

        {canManageTokens && (
          <SettingsSection
            title={t('users.tokens.title')}
            help={<HelpLink anchor="users.settings_tokens" />}
            description={t('users.tokens.description')}
            last
          >
            <TokensSection tokens={tokens} newToken={newToken} />
          </SettingsSection>
        )}
      </Main>
    </AuthenticatedLayout>
  )
}
