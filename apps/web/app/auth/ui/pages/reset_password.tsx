import type { InertiaProps } from '#core/ui/types'

import AuthLayout from '#auth/ui/components/layout'
import { ResetPasswordForm } from '#auth/ui/components/reset_password_form'

type PageProps = InertiaProps<{ token: string }>

export default function ResetPasswordPage(props: PageProps) {
  return (
    <AuthLayout>
      <ResetPasswordForm token={props.token} />
    </AuthLayout>
  )
}
