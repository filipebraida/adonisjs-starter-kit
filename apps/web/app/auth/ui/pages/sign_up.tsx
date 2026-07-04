import AuthLayout from '#auth/ui/components/auth_layout'
import { RegistrationForm } from '#auth/ui/components/registration_form'

export default function SignUpPage() {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  )
}
