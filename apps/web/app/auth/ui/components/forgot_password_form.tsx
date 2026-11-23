import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'

import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'

export function ForgotPasswordForm({ className }: { className?: string }) {
  const { t } = useTranslation()
  // A reset link that is unknown or expired sends the visitor back here with an error.
  const { error: errorMessage, success: sentMessage } = usePage().flash

  return (
    <Form
      route="auth.forgot_password.handle"
      className={cn('flex flex-col gap-6', className)}
      resetOnSuccess
    >
      {({ processing }) => (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t('auth.forgot_password.title')}</h1>
            <p className="text-balance text-sm text-muted-foreground">
              {t('auth.forgot_password.description')}
            </p>
          </div>

          {sentMessage && (
            <Alert role="status">
              <AlertDescription>{sentMessage}</AlertDescription>
            </Alert>
          )}

          <FieldSet>
            <FieldGroup>
              <Field name="email">
                <FieldLabel htmlFor="email">
                  {t('auth.forgot_password.form.email.label')}
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.forgot_password.form.email.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <FieldError errors={errorMessage ? [{ message: errorMessage }] : []} />

              <Field orientation="responsive">
                <Button type="submit" className="w-full" disabled={processing}>
                  {t('auth.forgot_password.actions.submit')}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="text-center text-sm">
            {t('auth.forgot_password.back_to_login.text')}{' '}
            <Link route="auth.sign_in.show" className="underline underline-offset-4">
              {t('auth.forgot_password.back_to_login.login')}
            </Link>
          </div>
        </>
      )}
    </Form>
  )
}
