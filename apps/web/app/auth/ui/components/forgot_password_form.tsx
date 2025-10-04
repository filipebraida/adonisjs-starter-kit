import React from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/hooks/use-toast'

import { useTranslation } from '#common/ui/hooks/use_translation'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post, reset } = useForm({
    email: '',
  })

  const { t } = useTranslation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/forgot-password', {
      onSuccess: () => {
        reset()

        toast(t('auth.forgot_password.toast.title'), {
          description: t('auth.forgot_password.toast.description'),
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.forgot_password.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.forgot_password.description')}
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">{t('auth.forgot_password.form.email.label')}</FieldLabel>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(element) => setData('email', element.target.value)}
              placeholder={t('auth.forgot_password.form.email.placeholder')}
              required
            />
            {errors?.email && (
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors.email}
              </p>
            )}
          </Field>

          <Field orientation="responsive">
            <Button type="submit" className="w-full">
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
    </form>
  )
}
