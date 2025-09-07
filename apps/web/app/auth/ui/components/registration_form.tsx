import React from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

import { useTranslation } from '#common/ui/hooks/use_translation'

export function RegistrationForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  const { t } = useTranslation()

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
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">{t('auth.registration.form.full_name.label')}</Label>
          <div>
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => setData('fullName', e.target.value)}
              placeholder={t('auth.registration.form.full_name.placeholder')}
              className={`${errors?.fullName ? 'border-destructive' : ''}`}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive">{errors?.fullName}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t('auth.registration.form.email.label')}</Label>
          <div>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder={t('auth.registration.form.email.placeholder')}
              className={`${errors?.email ? 'border-destructive' : ''}`}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive">{errors?.email}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t('auth.registration.form.password.label')}</Label>
          <div>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={t('auth.registration.form.password.placeholder')}
              className={`${errors?.password ? 'border-destructive' : ''}`}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive">{errors?.password}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="passwordConfirmation">
            {t('auth.registration.form.password_confirmation.label')}
          </Label>
          <div>
            <Input
              id="passwordConfirmation"
              type="password"
              value={data.passwordConfirmation}
              onChange={(e) => setData('passwordConfirmation', e.target.value)}
              placeholder={t('auth.registration.form.password_confirmation.placeholder')}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors?.passwordConfirmation}
            </p>
          </div>
        </div>
        <Button type="submit" className="w-full">
          {t('auth.registration.actions.submit')}
        </Button>
      </div>
      <div className="text-center text-sm">
        <span>{t('auth.registration.already_account.text')} </span>
        <Link route="auth.sign_in.show" className="underline underline-offset-4">
          {t('auth.registration.already_account.login')}
        </Link>
      </div>
    </form>
  )
}
