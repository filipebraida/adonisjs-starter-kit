import { useState } from 'react'

import { FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { PasswordInput } from '@workspace/ui/components/password-input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

import { Field, FieldError } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'
import type { Role } from '#users/ui/components/users_types'

export type UserFormDefaults = {
  fullName: string
  email: string
  role: string
}

interface Props {
  defaults: UserFormDefaults
  errors: Partial<Record<string, string>>
  roles: Role[]
}

/** Shared fields of the create and edit modals, inside a `<Form>`. */
export default function UserFormFields({ defaults, errors, roles }: Props) {
  const { t } = useTranslation()
  // The confirmation stays disabled until a password is typed.
  const [hasPassword, setHasPassword] = useState(false)

  return (
    <div className="space-y-4">
      <Field name="fullName">
        <FieldLabel htmlFor="fullName">{t('users.action.form.full_name.label')}</FieldLabel>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaults.fullName}
          placeholder={t('users.action.form.full_name.placeholder')}
          aria-invalid={!!errors.fullName}
        />
        <FieldError />
      </Field>

      <Field name="email">
        <FieldLabel htmlFor="email">{t('users.action.form.email.label')}</FieldLabel>
        <Input
          id="email"
          name="email"
          defaultValue={defaults.email}
          placeholder={t('users.action.form.email.placeholder')}
          aria-invalid={!!errors.email}
        />
        <FieldError />
      </Field>

      <Field name="role">
        <FieldLabel htmlFor="role">{t('users.action.form.role.label')}</FieldLabel>
        <Select name="role" defaultValue={defaults.role}>
          <SelectTrigger id="role" aria-invalid={!!errors.role}>
            <SelectValue placeholder={t('users.action.form.role.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <span className="flex gap-x-2 items-center">
                    {role.icon && <role.icon size={16} className="text-muted-foreground" />}
                    <span className="capitalize text-sm">{role.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError />
      </Field>

      <Field name="password">
        <FieldLabel htmlFor="password">{t('users.action.form.password.label')}</FieldLabel>
        <PasswordInput
          id="password"
          name="password"
          placeholder={t('users.action.form.password.placeholder')}
          onChange={(e) => setHasPassword(e.target.value !== '')}
          aria-invalid={!!errors.password}
        />
        <FieldError />
      </Field>

      <Field name="passwordConfirmation">
        <FieldLabel htmlFor="passwordConfirmation">
          {t('users.action.form.password_confirmation.label')}
        </FieldLabel>
        <PasswordInput
          id="passwordConfirmation"
          name="passwordConfirmation"
          disabled={!hasPassword}
          placeholder={t('users.action.form.password_confirmation.placeholder')}
          aria-invalid={!!errors.passwordConfirmation}
        />
        <FieldError />
      </Field>
    </div>
  )
}
