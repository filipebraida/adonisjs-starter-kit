import { Head } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'
import type { InertiaProps } from '#core/ui/app/types'

import AuthLayout from '#auth/ui/layouts/auth'
import { ResetPasswordForm } from '#auth/ui/components/reset_password_form'

type PageProps = InertiaProps<{ token: string }>

export default function ResetPasswordPage(props: PageProps) {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('auth.reset_password.title')} />
      <ResetPasswordForm token={props.token} />
    </AuthLayout>
  )
}
