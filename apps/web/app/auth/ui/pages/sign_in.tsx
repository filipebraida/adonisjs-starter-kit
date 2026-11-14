import { Head } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'
import { LoginForm } from '#auth/ui/components/login_form'
import AuthLayout from '#auth/ui/components/auth_layout'

export default function SignInPage() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('auth.signin.title')} />
      <LoginForm />
    </AuthLayout>
  )
}
