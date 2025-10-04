import React, { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'

import { useTranslation } from '#common/ui/hooks/use_translation'
import useFlashMessage from '#common/ui/hooks/use_flash_message'

export function RegistrationForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')

  const messages = useFlashMessage('errorsBag')

  useEffect(() => {
    if (messages) {
      let msg = ''
      for (let error of Object.entries(messages)) {
        msg += error[1]
      }
      setErrorMessage(msg)
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/sign-up')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.registration.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.registration.description')}
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fullName">
              {t('auth.registration.form.full_name.label')}
            </FieldLabel>
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => setData('fullName', e.target.value)}
              placeholder={t('auth.registration.form.full_name.placeholder')}
              className={`${errors?.fullName ? 'border-destructive' : ''}`}
              required
            />
            {errors?.fullName && (
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors.fullName}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">{t('auth.registration.form.email.label')}</FieldLabel>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder={t('auth.registration.form.email.placeholder')}
              className={`${errors?.email ? 'border-destructive' : ''}`}
              required
            />
            {errors?.email && (
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors.email}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">{t('auth.registration.form.password.label')}</FieldLabel>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={t('auth.registration.form.password.placeholder')}
              className={`${errors?.password ? 'border-destructive' : ''}`}
              required
            />
            {errors?.password && (
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors.password}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">
              {t('auth.registration.form.password_confirmation.label')}
            </FieldLabel>
            <Input
              id="passwordConfirmation"
              type="password"
              value={data.passwordConfirmation}
              onChange={(e) => setData('passwordConfirmation', e.target.value)}
              placeholder={t('auth.registration.form.password_confirmation.placeholder')}
              required
            />
            {errors?.passwordConfirmation && (
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors.passwordConfirmation}
              </p>
            )}
          </Field>

          <Field orientation="responsive">
            <Button type="submit" className="w-full">
              {t('auth.registration.actions.submit')}
            </Button>
            {errorMessage && (
              <p className="text-[0.8rem] text-center font-medium text-destructive col-span-1">
                {errorMessage}
              </p>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="text-center text-sm">
        <span>{t('auth.registration.already_account.text')} </span>
        <Link route="auth.sign_in.show" className="underline underline-offset-4">
          {t('auth.registration.already_account.login')}
        </Link>
      </div>
    </form>
  )
}
