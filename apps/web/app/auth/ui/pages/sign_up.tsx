import AuthLayout from '#auth/ui/components/layout'
import { RegistrationForm } from '#auth/ui/components/registration_form'

export default function SignUpPage() {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  )
}
