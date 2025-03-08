import { useEffect } from 'react'

import { toast } from '@workspace/ui/hooks/use-toast'

import useFlashMessage from '#common/ui/hooks/use_flash_message'

import { ForgotPasswordForm } from '#auth/ui/components/forgot_password_form'
import AuthLayout from '#auth/ui/components/layout'

export default function SignInPage() {
  const success = useFlashMessage('success')
  const resetPasswordError = useFlashMessage('resetPasswordError')

  useEffect(() => {
    if (success) {
      toast({
        title: 'Email enviado',
        description: 'Enviamos o link para recuperação da sua senha.',
      })
    }
    if (resetPasswordError) {
      toast({
        title: 'Something went wrong',
        description: 'Please enter your email to generate a new password reset link.',
      })
    }
  }, [success, resetPasswordError])

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
