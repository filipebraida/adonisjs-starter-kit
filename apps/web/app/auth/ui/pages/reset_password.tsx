import { ResetPasswordForm } from '#auth/ui/components/reset_password_form'
import AuthLayout from '#auth/ui/components/layout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  )
}
