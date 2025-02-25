import { useEffect } from 'react'

import { toast } from '@workspace/ui/hooks/use-toast'

import useFlashMessage from '#common/ui/hooks/use_flash_message'

import { ForgotPasswordForm } from '#auth/ui/components/forgot_password_form'
import AuthLayout from '#auth/ui/components/layout'

export default function SignInPage() {
  const success = useFlashMessage('success')

  useEffect(() => {
    if (success) {
      toast({
        title: 'Email enviado',
        description: 'Enviamos o link para recuperação da sua senha.',
      })
    }
  }, [success])

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
