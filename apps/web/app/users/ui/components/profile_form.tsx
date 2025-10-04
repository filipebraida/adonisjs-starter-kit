import React, { useRef, useState } from 'react'
import { useForm } from '@inertiajs/react'

import { UserAvatar } from '#common/ui/components/user_avatar'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Progress } from '@workspace/ui/components/progress'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { toast } from '@workspace/ui/hooks/use-toast'

import type UserDto from '#users/dtos/user'

interface Props {
  user: UserDto
}

export function ProfileForm({ user }: Props) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data, setData, errors, put, progress } = useForm({
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

    put('/settings/profile', {
      preserveScroll: true,
      onSuccess: () => {
        setPreviewUrl(null)

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
            <div className="col-span-full flex items-center gap-x-8">
              <UserAvatar
                user={{ ...user, avatarUrl: previewUrl ?? user.avatarUrl }}
                className="size-24 flex-none rounded-lg object-cover"
              />

              <div>
                <Button type="button" onClick={() => avatarInputRef.current?.click()}>
                  {t('users.action.actions.change_avatar')}
                </Button>
                <p className="mt-2 text-xs/5">JPG, GIF or PNG. 1MB max.</p>
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
              className={errors?.fullName ? 'border-destructive' : ''}
            />
            <FieldErrorBag errors={errors} field="fullName" />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">{t('users.action.form.email.label')}</FieldLabel>
            <p id="email">{user.email}</p>
          </Field>

          {progress && (
            <Field>
              <Progress value={progress.percentage} max={100} className="w-full h-2 rounded mt-2" />
            </Field>
          )}

          <Field orientation="responsive">
            <Button type="submit">{t('users.action.actions.save')}</Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
