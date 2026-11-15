import { useRef } from 'react'
import { type FormRef } from '@adonisjs/inertia/react'
import { Modal } from 'adonis-inertia-modal/react'
import { MailPlus, Send } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { FieldLabel } from '@workspace/ui/components/field'
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

import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { userRoles } from '#users/ui/components/users_types'
import { ROLES } from '#auth/enums/role'

import type { InertiaProps } from '#core/ui/app/types'

type PageProps = InertiaProps<{ institutionalRoles: string[]; canManageRoles: boolean }>

export default function InviteUserPage({ institutionalRoles, canManageRoles }: PageProps) {
  const { t } = useTranslation()
  const roles = userRoles(t, institutionalRoles, canManageRoles)
  const formRef = useRef<FormRef>(null)

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

          <Form
            ref={formRef}
            route="users.invite.handle"
            options={{ preserveScroll: true }}
            onSuccess={() => {
              const { email } = formRef.current?.getData() ?? {}
              close()
              toast(t('users.invite.toast.title'), { description: email })
            }}
            className="space-y-4"
          >
            {({ errors, processing }) => (
              <>
                <Field name="email">
                  <FieldLabel htmlFor="email">{t('users.invite.form.email.label')}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    placeholder={t('users.invite.form.email.placeholder')}
                    aria-invalid={!!errors.email}
                  />
                  <FieldError />
                </Field>

                <Field name="role">
                  <FieldLabel htmlFor="role">{t('users.invite.form.role.label')}</FieldLabel>
                  <Select name="role" defaultValue={ROLES.USER}>
                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                      <SelectValue placeholder={t('users.invite.form.role.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <span className="flex gap-x-2 items-center">
                              {role.icon && (
                                <role.icon size={16} className="text-muted-foreground" />
                              )}
                              <span className="capitalize text-sm">{role.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError />
                </Field>

                <Field name="description">
                  <FieldLabel htmlFor="description">
                    {t('users.invite.form.description.label')}
                  </FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder={t('users.invite.form.description.placeholder')}
                    className="resize-none"
                    aria-invalid={!!errors.description}
                  />
                  <FieldError />
                </Field>

                <footer className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={close}>
                    {t('users.invite.actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {t('users.invite.actions.submit')} <Send />
                  </Button>
                </footer>
              </>
            )}
          </Form>
        </div>
      )}
    </Modal>
  )
}
