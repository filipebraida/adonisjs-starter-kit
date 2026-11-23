import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, FieldLabel } from '@workspace/ui/components/field'

export function ResetPasswordForm({ token, className }: { token: string; className?: string }) {
  const { t } = useTranslation()

  return (
    <Form
      route="auth.reset_password.handle"
      routeParams={{ token }}
      resetOnSuccess={['password', 'passwordConfirmation']}
      resetOnError={['password', 'passwordConfirmation']}
      className={cn('flex flex-col gap-6', className)}
    >
      {({ processing }) => (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t('auth.reset_password.title')}</h1>
            <p className="text-balance text-sm text-muted-foreground">
              {t('auth.reset_password.description')}
            </p>
          </div>

          <FieldSet>
            <FieldGroup>
              <Field name="password">
                <FieldLabel htmlFor="password">
                  {t('auth.reset_password.form.password.label')}
                </FieldLabel>
                <PasswordInput id="password" name="password" required />
                <FieldError />
              </Field>

              <Field name="passwordConfirmation">
                <FieldLabel htmlFor="passwordConfirmation">
                  {t('auth.reset_password.form.password_confirmation.label')}
                </FieldLabel>
                <PasswordInput id="passwordConfirmation" name="passwordConfirmation" required />
                <FieldError />
              </Field>

              <Field orientation="responsive">
                <Button type="submit" className="w-full" disabled={processing}>
                  {t('auth.reset_password.actions.submit')}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </>
      )}
    </Form>
  )
}
