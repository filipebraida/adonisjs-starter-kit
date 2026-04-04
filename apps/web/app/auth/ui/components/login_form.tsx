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
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
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
