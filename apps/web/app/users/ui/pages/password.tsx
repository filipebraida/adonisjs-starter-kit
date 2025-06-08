import { InferPageProps } from '@adonisjs/inertia/types'

import type PasswordController from '#users/controllers/password_controller'

import AppLayout from '#common/ui/components/app_layout'
import HeadingSmall from '#common/ui/components/heading_small'
import { PasswordForm } from '#users/ui/components/password_form'
import SettingsLayout from '#users/ui/components/settings_layout'

import { useTranslation } from '#common/ui/hooks/use_translation'

export default function PasswordPage({}: InferPageProps<PasswordController, 'show'>) {
  const { t } = useTranslation()
  const currentPath = '/settings/password'

  return (
    <AppLayout breadcrumbs={[{ label: t('users.password.breadcrumbs.settings') }]}>
      <SettingsLayout currentPath={currentPath}>
        <div className="space-y-6">
          <HeadingSmall
            title={t('users.password.title')}
            description={t('users.password.description')}
          />

          <PasswordForm />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
