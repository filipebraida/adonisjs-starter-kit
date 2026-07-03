import { Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
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

import { useTranslation } from '#common/ui/hooks/use_translation'
import { userRoles } from '#users/ui/components/users_types'
import type { Role as RoleSlug } from '#users/enums/role'

export type UserFormData = {
  fullName: string
  email: string
  role: RoleSlug
  password: string
  passwordConfirmation: string
}

interface Props {
  data: UserFormData
  errors: Partial<Record<keyof UserFormData, string>>
  setData: (key: keyof UserFormData, value: string) => void
}

/** Shared form fields for create and edit modals. */
export default function UserFormFields({ data, errors, setData }: Props) {
  const { t } = useTranslation()
  const roles = userRoles(t)

  return (
    <div className="space-y-4">
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
        <Input
          id="email"
          placeholder={t('users.action.form.email.placeholder')}
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          className={errors?.email ? 'border-destructive' : ''}
        />
        <FieldErrorBag errors={errors} field="email" />
      </Field>

      <Field>
        <FieldLabel htmlFor="role">{t('users.action.form.role.label')}</FieldLabel>
        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
          <SelectTrigger className={errors?.role ? 'border-destructive' : ''}>
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
        <FieldErrorBag errors={errors} field="role" />
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
          onChange={(e) => setData('passwordConfirmation', e.target.value)}
          className={errors?.passwordConfirmation ? 'border-destructive' : ''}
        />
        <FieldErrorBag errors={errors} field="passwordConfirmation" />
      </Field>
    </div>
  )
}
