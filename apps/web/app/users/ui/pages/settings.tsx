import type { InertiaProps } from '#core/ui/types'
import type { Data } from '@generated/data'

import AppLayout from '#common/ui/components/app_layout'
import { AppearanceForm } from '#users/ui/components/appearance_form'
import { PasswordForm } from '#users/ui/components/password_form'
import { ProfileForm } from '#users/ui/components/profile_form'
import { SettingsSection } from '#users/ui/components/settings_section'
import { TokensSection } from '#users/ui/components/tokens_section'

import useCan from '#common/ui/hooks/use_can'
import { useTranslation } from '#common/ui/hooks/use_translation'

type PageProps = InertiaProps<{
  profile: Data.Users.User.Variants['forProfile']
  tokens: Data.Users.Token[]
  newToken: { name: string; value: string } | null
}>

export default function SettingsPage({ profile, tokens, newToken }: PageProps) {
  const { t } = useTranslation()
  const can = useCan()

  return (
    <AppLayout breadcrumbs={[{ label: t('users.layout.title') }]}>
      <div className="mx-auto w-full max-w-[840px] px-4 pt-8 pb-24 sm:px-6 lg:px-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{t('users.layout.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('users.layout.description')}</p>
        </header>

        <SettingsSection
          title={t('users.profile.title')}
          description={t('users.profile.description')}
        >
          <ProfileForm user={profile} />
        </SettingsSection>

        <SettingsSection
          title={t('users.password.title')}
          description={t('users.password.description')}
        >
          <PasswordForm />
        </SettingsSection>

        <SettingsSection
          title={t('users.appearance.title')}
          description={t('users.appearance.description')}
          last={!can.manageTokens}
        >
          <AppearanceForm />
        </SettingsSection>

        {can.manageTokens && (
          <SettingsSection
            title={t('users.tokens.title')}
            description={t('users.tokens.description')}
            last
          >
            <TokensSection tokens={tokens} newToken={newToken} />
          </SettingsSection>
        )}
      </div>
    </AppLayout>
  )
}
