// useForm and not <Form>: the role is a Radix Select driven by the form state, and the
// success toast names the invited email.
import { useForm } from '@inertiajs/react'
import { Modal } from 'adonis-inertia-modal/react'
import { MailPlus, Send } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { toast } from '@workspace/ui/hooks/use-toast'

import { urlFor } from '~/app/client'

import { useTranslation } from '#core/ui/hooks/use_translation'
import { userRoles } from '#users/ui/components/users_types'
import { ROLES, type Role as RoleSlug } from '#auth/enums/role'

export default function InviteUserPage() {
  const { t } = useTranslation()
  const roles = userRoles(t)

  const { data, setData, errors, post, processing } = useForm<{
    email: string
    role: RoleSlug
    description: string | null
  }>({
    email: '',
    role: ROLES.USER,
    description: '',
  })

  return (
    <Modal maxWidth="md">
      {({ close }) => (
        <div className="space-y-4">
          <header className="text-left space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MailPlus /> {t('users.invite.title')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('users.invite.description')}</p>
          </header>

          <form
            id="invite-user-form"
            onSubmit={(e) => {
              e.preventDefault()
              post(urlFor('users.invite.handle'), {
                preserveScroll: true,
                onSuccess: () => {
                  close()
                  toast(t('users.invite.toast.title'), { description: data.email })
                },
              })
            }}
            className="space-y-4"
          >
            <Field>
              <FieldLabel htmlFor="email">{t('users.invite.form.email.label')}</FieldLabel>
              <Input
                id="email"
                placeholder={t('users.invite.form.email.placeholder')}
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                aria-invalid={!!errors?.email}
              />
              <FieldErrorBag errors={errors} field="email" />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">{t('users.invite.form.role.label')}</FieldLabel>
              <Select
                value={data.role}
                onValueChange={(value) => setData('role', value as RoleSlug)}
              >
                <SelectTrigger aria-invalid={!!errors?.role}>
                  <SelectValue placeholder={t('users.invite.form.role.placeholder')} />
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
              <FieldLabel htmlFor="description">
                {t('users.invite.form.description.label')}
              </FieldLabel>
              <Textarea
                id="description"
                placeholder={t('users.invite.form.description.placeholder')}
                value={data.description ?? ''}
                onChange={(e) => setData('description', e.target.value)}
                className="resize-none"
                aria-invalid={!!errors?.description}
              />
              <FieldErrorBag errors={errors} field="description" />
            </Field>
          </form>

          <footer className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>
              {t('users.invite.actions.cancel')}
            </Button>
            <Button type="submit" form="invite-user-form" disabled={processing}>
              {t('users.invite.actions.submit')} <Send />
            </Button>
          </footer>
        </div>
      )}
    </Modal>
  )
}
