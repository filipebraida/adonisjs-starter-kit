import React from 'react'
// useForm and not <Form>: the confirmation stays disabled until a password is typed, so
// the screen reads the value as it changes.
import { useForm } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'
import { PasswordInput } from '#core/ui/components/password_input'
import { urlFor } from '~/app/client'

import { Button } from '@workspace/ui/components/button'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import { toast } from '@workspace/ui/hooks/use-toast'

/** `onClose` closes the form back to reading: after a save, and on Cancel. */
export function PasswordForm({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()

  const { data, setData, errors, put, reset, processing } = useForm({
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    put(urlFor('password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        onClose?.()

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
              aria-invalid={!!errors?.password}
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
              aria-invalid={!!errors?.passwordConfirmation}
            />
            <FieldErrorBag errors={errors} field="passwordConfirmation" />
          </Field>

          <Field orientation="responsive">
            <div className="flex gap-2">
              <Button type="submit" disabled={processing}>
                {t('users.action.actions.save')}
              </Button>
              {onClose && (
                <Button type="button" variant="ghost" onClick={onClose}>
                  {t('users.action.actions.cancel')}
                </Button>
              )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
