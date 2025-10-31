import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { Progress } from '@workspace/ui/components/progress'
import { toast } from '@workspace/ui/hooks/use-toast'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@workspace/ui/components/select'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { Role } from '#users/ui/components/users_types'

import type UserDto from '#users/dtos/user'

import Roles from '#users/enums/role'

interface Props {
  roles: Role[]
  currentRow?: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ roles, currentRow, open, onOpenChange }: Props) {
  const { t } = useTranslation()

  const isEdit = !!currentRow

  const { data, setData, errors, post, put, progress, clearErrors, reset } = useForm({
    fullName: currentRow && currentRow.fullName ? currentRow.fullName : '',
    email: currentRow ? currentRow.email : '',
    roleId: currentRow ? String(currentRow.roleId) : String(Roles.USER),
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const url = isEdit ? `/users/${currentRow?.id}` : '/users'
    const method = isEdit ? put : post

    method(url, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => {
        onOpenChange(false)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
        toast(t('users.action.toast.title'), {
          description: (
            <div className="mt-2 max-w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
              <pre className="text-white whitespace-pre-wrap break-words">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          ),
        })
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            {t(isEdit ? 'users.action.edit.title' : 'users.action.create.title')}
          </DialogTitle>
          <DialogDescription>
            {t(isEdit ? 'users.action.edit.description' : 'users.action.create.description')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4 p-0.5">
            <Field>
              <FieldLabel htmlFor="fullName">{t('users.action.form.full_name.label')}</FieldLabel>
              <Input
                id="fullName"
                placeholder={t('users.action.form.full_name.placeholder')}
                value={data.fullName}
                onChange={(element) => setData('fullName', element.target.value)}
                className={`${errors?.fullName ? 'border-destructive' : ''}`}
              />
              <FieldErrorBag errors={errors} field="fullName" />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">{t('users.action.form.email.label')}</FieldLabel>
              <Input
                id="email"
                placeholder={t('users.action.form.email.placeholder')}
                value={data.email}
                onChange={(element) => setData('email', element.target.value)}
                className={`${errors?.email ? 'border-destructive' : ''}`}
              />
              <FieldErrorBag errors={errors} field="email" />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">{t('users.action.form.role.label')}</FieldLabel>
              <Select value={data.roleId} onValueChange={(v) => setData('roleId', v)}>
                <SelectTrigger className={`${errors?.roleId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={t('users.action.form.role.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((role) => {
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <span className="flex gap-x-2 items-center">
                            {role.icon && <role.icon size={16} className="text-muted-foreground" />}
                            <span className="capitalize text-sm">{role.label}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldErrorBag errors={errors} field="roleId" />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{t('users.action.form.password.label')}</FieldLabel>
              <PasswordInput
                id="password"
                placeholder={t('users.action.form.password.placeholder')}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className={errors?.password ? 'border-destructive' : ''}
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

            {progress && (
              <Progress value={progress.percentage} max={100} className="w-full h-2 rounded mt-2" />
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">{t('users.action.actions.cancel')}</Button>
          </DialogClose>
          <Button type="submit" form="user-form">
            {t(isEdit ? 'users.action.actions.save' : 'users.action.actions.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
