import { ForgotPasswordForm } from '#auth/ui/components/forgot_password_form'
import AuthLayout from '#auth/ui/components/auth_layout'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
