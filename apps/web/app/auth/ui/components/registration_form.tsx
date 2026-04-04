import { Link } from '@adonisjs/inertia/react'

import { Field, FieldError, Form } from '#common/ui/components/form'
import { useTranslation } from '#common/ui/hooks/use_translation'
import useFlashMessage from '#common/ui/hooks/use_flash_message'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, FieldLabel } from '@workspace/ui/components/field'

import { PasswordInput } from '@workspace/ui/components/password-input'

export function RegistrationForm({ className }: { className?: string }) {
  const { t } = useTranslation()

  const errorMessage = useFlashMessage('error')

  return (
    <Form route="auth.sign_up.handle" className={cn('flex flex-col gap-6', className)}>
      {({ processing }) => (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t('auth.registration.title')}</h1>
            <p className="text-balance text-sm text-muted-foreground">
              {t('auth.registration.description')}
            </p>
          </div>

          <FieldSet>
            <FieldGroup>
              <Field name="fullName">
                <FieldLabel htmlFor="fullName">
                  {t('auth.registration.form.full_name.label')}
                </FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder={t('auth.registration.form.full_name.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <Field name="email">
                <FieldLabel htmlFor="email">{t('auth.registration.form.email.label')}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.registration.form.email.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <Field name="password">
                <FieldLabel htmlFor="password">
                  {t('auth.registration.form.password.label')}
                </FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder={t('auth.registration.form.password.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <Field name="passwordConfirmation">
                <FieldLabel htmlFor="passwordConfirmation">
                  {t('auth.registration.form.password_confirmation.label')}
                </FieldLabel>
                <PasswordInput
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  placeholder={t('auth.registration.form.password_confirmation.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <Field orientation="responsive">
                <Button type="submit" className="w-full" disabled={processing}>
                  {t('auth.registration.actions.submit')}
                </Button>

                <FieldError errors={errorMessage ? [{ message: errorMessage }] : []} />
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="text-center text-sm">
            <span>{t('auth.registration.already_account.text')} </span>
            <Link route="auth.sign_in.show" className="underline underline-offset-4">
              {t('auth.registration.already_account.login')}
            </Link>
          </div>
        </>
      )}
    </Form>
  )
}
