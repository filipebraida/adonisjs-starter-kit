import { InferPageProps } from '@adonisjs/inertia/types'

import type PasswordController from '#users/controllers/password_controller'

import AppLayout from '#common/ui/components/app_sidebar_layout'
import HeadingSmall from '#common/ui/components/heading_small'
import { PasswordForm } from '#users/ui/components/password_form'

import SettingsLayout from '#users/ui/components/settings_layout'

export default function PasswordPage({}: InferPageProps<PasswordController, 'show'>) {
  const currentPath = '/settings/password'

  return (
    <AppLayout breadcrumbs={[{ label: 'Users' }]}>
      <SettingsLayout currentPath={currentPath}>
        <div className="space-y-6">
          <HeadingSmall
            title="Update password"
            description="Ensure your account is using a long, random password to stay secure"
          />
          <PasswordForm />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
