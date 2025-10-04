import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Progress } from '@workspace/ui/components/progress'

import { toast } from '@workspace/ui/hooks/use-toast'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { useTranslation } from '#common/ui/hooks/use_translation'

export function PasswordForm() {
  const { t } = useTranslation()

  const { data, setData, errors, put, progress, reset } = useForm({
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    put('/settings/password', {
      preserveScroll: true,
      onSuccess: () => {
        reset()

        toast(t('users.action.toast.type_success'), {
          description: t('users.action.toast.settings_updated', {
            setting: t('users.layout.password'),
          }),
        })
      },
      onError: () => {
        reset()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 mx-1">
        <Label htmlFor="password">{t('users.action.form.password.label')}</Label>
        <PasswordInput
          id="password"
          placeholder={t('users.action.form.password.placeholder')}
          value={data.password}
          onChange={(element) => setData('password', element.target.value)}
          className={`${errors?.password ? 'border-destructive' : ''}`}
        />
        <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
          {errors?.password}
        </p>
      </div>

      <div className="space-y-2 mx-1">
        <Label htmlFor="passwordConfirmation">
          {t('users.action.form.password_confirmation.label')}
        </Label>
        <PasswordInput
          id="passwordConfirmation"
          disabled={data.password === ''}
          placeholder={t('users.action.form.password_confirmation.placeholder')}
          value={data.passwordConfirmation}
          onChange={(element) => setData('passwordConfirmation', element.target.value)}
          className={`${errors?.passwordConfirmation ? 'border-destructive' : ''}`}
        />
        <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
          {errors?.passwordConfirmation}
        </p>
      </div>

      {progress && (
        <Progress value={progress.percentage} max={100} className="w-full h-2 rounded mt-2" />
      )}

      <div className="pt-2">
        <Button type="submit">{t('users.action.actions.save')}</Button>
      </div>
    </form>
  )
}
