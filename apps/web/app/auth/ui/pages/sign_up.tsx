import { Head } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'
import AuthLayout from '#auth/ui/components/auth_layout'
import { RegistrationForm } from '#auth/ui/components/registration_form'

export default function SignUpPage() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('auth.registration.title')} />
      <RegistrationForm />
    </AuthLayout>
  )
}
