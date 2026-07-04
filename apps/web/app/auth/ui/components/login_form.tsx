import { Link } from '@adonisjs/inertia/react'

import { Field, FieldError, Form } from '#common/ui/components/form'
import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, FieldLabel, FieldSeparator } from '@workspace/ui/components/field'

import { PasswordInput } from '@workspace/ui/components/password-input'

export function LoginForm({ className }: { className?: string }) {
  const { t } = useTranslation()

  const errorMessage = useFlashMessage('error')

  return (
    <Form route="auth.sign_in.handle" className={cn('flex flex-col gap-6', className)}>
      {({ processing }) => (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t('auth.signin.title')}</h1>
            <p className="text-balance text-sm text-muted-foreground">
              {t('auth.signin.description')}
            </p>
          </div>

          <FieldSet>
            <FieldGroup>
              <Field name="email">
                <FieldLabel htmlFor="email">{t('auth.signin.form.email.label')}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.signin.form.email.placeholder')}
                  required
                />
                <FieldError />
              </Field>
              <Field name="password">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t('auth.signin.form.password.label')}</FieldLabel>
                  <Link
                    route="auth.forgot_password.show"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t('auth.signin.actions.forgot_password')}
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder={t('auth.signin.form.password.placeholder')}
                  required
                />
                <FieldError />
              </Field>

              <Field orientation="responsive">
                <Button type="submit" disabled={processing}>
                  {t('auth.signin.actions.submit')}
                </Button>
              </Field>

              <FieldError errors={errorMessage ? [{ message: errorMessage }] : []} />

              <FieldSeparator>{t('auth.signin.divider')}</FieldSeparator>

              <Button variant="outline" className="w-full" asChild>
                <Link route="social.create" routeParams={{ provider: 'google' }}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 4.75C13.77 4.75 15.36 5.36 16.61 6.55L20.03 3.13C17.95 1.19 15.24 0 12 0C7.31 0 3.26 2.69 1.28 6.61L5.27 9.7C6.22 6.86 8.87 4.75 12 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.28C23.49 11.49 23.42 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.95 21.1C22.2 19.01 23.49 15.92 23.49 12.28Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26 14.29C5.02 13.57 4.89 12.8 4.89 12C4.89 11.2 5.02 10.43 5.26 9.7L1.28 6.61C0.46 8.23 0 10.06 0 12C0 13.94 0.46 15.77 1.28 17.39L5.26 14.29Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 24C15.24 24 17.97 22.94 19.95 21.1L16.08 18.1C15.01 18.82 13.62 19.25 12 19.25C8.87 19.25 6.22 17.14 5.27 14.29L1.28 17.39C3.26 21.31 7.31 24 12 24Z"
                      fill="#34A853"
                    />
                  </svg>
                  {t('auth.signin.actions.google')}
                </Link>
              </Button>
            </FieldGroup>
          </FieldSet>
          <div className="text-center text-sm">
            <span>{t('auth.signin.no_account.text')} </span>
            <Link route="auth.sign_up.show" className="underline underline-offset-4">
              {t('auth.signin.no_account.sign_up')}
            </Link>
          </div>
        </>
      )}
    </Form>
  )
}
