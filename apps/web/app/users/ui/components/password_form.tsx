import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import { toast } from '@workspace/ui/hooks/use-toast'
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
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">{t('users.action.form.password.label')}</FieldLabel>
            <PasswordInput
              id="password"
              placeholder={t('users.action.form.password.placeholder')}
              value={data.password}
              onChange={(element) => setData('password', element.target.value)}
              className={`${errors?.password ? 'border-destructive' : ''}`}
            />
            <FieldErrorBag errors={errors} field="password" />
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">
              {t('users.action.form.password_confirmation.label')}
            </FieldLabel>
            <PasswordInput
              id="passwordConfirmation"
              disabled={data.password === ''}
              placeholder={t('users.action.form.password_confirmation.placeholder')}
              value={data.passwordConfirmation}
              onChange={(element) => setData('passwordConfirmation', element.target.value)}
              className={`${errors?.passwordConfirmation ? 'border-destructive' : ''}`}
            />
            <FieldErrorBag errors={errors} field="passwordConfirmation" />
          </Field>
        </FieldGroup>
      </FieldSet>

      {progress && (
        <Progress value={progress.percentage} max={100} className="w-full h-2 rounded mt-2" />
      )}

      <div className="pt-2">
        <Button type="submit">{t('users.action.actions.save')}</Button>
      </div>
    </form>
  )
}
