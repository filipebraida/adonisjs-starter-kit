import { Head } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'
import { ForgotPasswordForm } from '#auth/ui/components/forgot_password_form'
import AuthLayout from '#auth/ui/components/auth_layout'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('auth.forgot_password.title')} />
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
