import { useRef } from 'react'
import { type FormRef } from '@adonisjs/inertia/react'
import { Modal } from 'adonis-inertia-modal/react'

import { Button } from '@workspace/ui/components/button'
import { toast } from '@workspace/ui/hooks/use-toast'

import { Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'
import UserFormFields from '#users/ui/components/user_form_fields'
import { userRoles } from '#users/ui/components/users_types'
import { ROLES } from '#auth/enums/role'

import type { InertiaProps } from '#core/ui/app/types'

type PageProps = InertiaProps<{ institutionalRoles: string[]; canManageRoles: boolean }>

export default function CreateUserPage({ institutionalRoles, canManageRoles }: PageProps) {
  const { t } = useTranslation()
  const formRef = useRef<FormRef>(null)

  return (
    <Modal maxWidth="md">
      {({ close }) => (
        <div className="space-y-4">
          <header className="text-left space-y-1">
            <h2 className="text-lg font-semibold">{t('users.action.create.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('users.action.create.description')}</p>
          </header>

          <Form
            ref={formRef}
            route="users.store"
            options={{ preserveScroll: true }}
            resetOnError={['password', 'passwordConfirmation']}
            onSuccess={() => {
              const { fullName, email } = formRef.current?.getData() ?? {}
              close()
              toast(t('users.action.toast.title'), { description: fullName || email })
            }}
          >
            {({ errors, processing }) => (
              <>
                <UserFormFields
                  defaults={{ fullName: '', email: '', role: ROLES.USER }}
                  errors={errors}
                  roles={userRoles(t, institutionalRoles, canManageRoles)}
                />

                <footer className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={close}>
                    {t('users.action.actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {t('users.action.actions.add')}
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
