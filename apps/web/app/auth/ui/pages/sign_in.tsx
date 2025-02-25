import { LoginForm } from '#auth/ui/components/login_form'
import AuthLayout from '#auth/ui/components/layout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
