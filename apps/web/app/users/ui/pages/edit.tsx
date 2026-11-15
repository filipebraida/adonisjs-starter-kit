import { useRef } from 'react'
import { type FormRef } from '@adonisjs/inertia/react'
import { Modal } from 'adonis-inertia-modal/react'

import { Button } from '@workspace/ui/components/button'
import { toast } from '@workspace/ui/hooks/use-toast'

import { Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'
import UserFormFields from '#users/ui/components/user_form_fields'
import { userRoles } from '#users/ui/components/users_types'
import { displayRole, ROLES } from '#auth/enums/role'

import type { InertiaProps } from '#core/ui/app/types'
import type { Data } from '@generated/data'

type PageProps = InertiaProps<{
  user: Data.Users.User.Variants['forEdit']
  institutionalRoles: string[]
}>

export default function EditUserPage({ user, institutionalRoles }: PageProps) {
  const { t } = useTranslation()
  const formRef = useRef<FormRef>(null)

  return (
    <Modal maxWidth="md">
      {({ close }) => (
        <div className="space-y-4">
          <header className="text-left space-y-1">
            <h2 className="text-lg font-semibold">{t('users.action.edit.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('users.action.edit.description')}</p>
          </header>

          <Form
            ref={formRef}
            route="users.update"
            routeParams={{ id: user.id }}
            options={{ preserveScroll: true }}
            resetOnError={['password', 'passwordConfirmation']}
            onSuccess={() => {
              const { email } = formRef.current?.getData() ?? {}
              close()
              toast(t('users.action.toast.title'), { description: email })
            }}
          >
            {({ errors, processing }) => (
              <>
                <UserFormFields
                  defaults={{
                    fullName: user.fullName ?? '',
                    email: user.email,
                    role: displayRole(user.roles) ?? ROLES.USER,
                  }}
                  errors={errors}
                  roles={userRoles(t, institutionalRoles)}
                />

                <footer className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={close}>
                    {t('users.action.actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {t('users.action.actions.save')}
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
