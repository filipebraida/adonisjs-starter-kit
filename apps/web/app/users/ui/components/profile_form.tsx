// useForm and not <Form>: the avatar upload reports its progress and previews the picked
// file before the submit.
import { useForm } from '@inertiajs/react'
import React, { useRef, useState } from 'react'

import { UserAvatar } from '#core/ui/components/user_avatar'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { Input } from '@workspace/ui/components/input'
import { Progress } from '@workspace/ui/components/progress'
import { toast } from '@workspace/ui/hooks/use-toast'

import type { Data } from '@generated/data'

interface Props {
  user: Data.Users.User.Variants['forProfile']
  /** Closes the form back to reading: after a save, and on Cancel. */
  onClose?: () => void
}

export function ProfileForm({ user, onClose }: Props) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data, setData, errors, put, progress, processing } = useForm({
    fullName: user.fullName ?? '',
    avatar: null as File | null,
  })

  const avatarInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setData('avatar', file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    put(urlFor('profile.update'), {
      preserveScroll: true,
      onSuccess: () => {
        setPreviewUrl(null)
        onClose?.()

        toast(t('users.action.toast.type_success'), {
          description: t('users.action.toast.settings_updated', {
            setting: t('users.layout.profile'),
          }),
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <FieldSet>
        <FieldGroup>
          <Field>
            <div className="flex items-center gap-4">
              <UserAvatar
                user={{ ...user, avatarUrl: previewUrl ?? user.avatarUrl }}
                className="size-16"
              />

              <div className="grid gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {t('users.action.actions.change_avatar')}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t('users.action.actions.avatar_hint')}
                </span>
              </div>
            </div>

            <Input
              ref={avatarInputRef}
              id="avatar"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <FieldErrorBag errors={errors} field="avatar" />
          </Field>

          <Field>
            <FieldLabel htmlFor="fullName">{t('users.action.form.full_name.label')}</FieldLabel>
            <Input
              id="fullName"
              placeholder={t('users.action.form.full_name.placeholder')}
              value={data.fullName}
              onChange={(e) => setData('fullName', e.target.value)}
              aria-invalid={!!errors?.fullName}
            />
            <FieldErrorBag errors={errors} field="fullName" />
          </Field>

          <Field data-disabled>
            <FieldLabel htmlFor="email">{t('users.action.form.email.label')}</FieldLabel>
            <Input id="email" value={user.email} disabled />
            <FieldDescription>{t('users.profile.email_locked')}</FieldDescription>
          </Field>

          {progress && (
            <Field>
              <Progress value={progress.percentage} max={100} className="mt-2 h-2" />
            </Field>
          )}

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
