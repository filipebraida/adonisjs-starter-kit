import { LoginForm } from '#auth/ui/components/login_form'
import AuthLayout from '#auth/ui/components/auth_layout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
