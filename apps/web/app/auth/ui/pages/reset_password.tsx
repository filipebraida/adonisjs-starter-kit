import { InferPageProps } from '@adonisjs/inertia/types'

import { ResetPasswordForm } from '#auth/ui/components/reset_password_form'
import AuthLayout from '#auth/ui/components/layout'

import type ResetPasswordController from '#auth/controllers/reset_password_controller'

export default function ResetPasswordPage(props: InferPageProps<ResetPasswordController, 'show'>) {
  return (
    <AuthLayout>
      <ResetPasswordForm token={props.token} />
    </AuthLayout>
  )
}
