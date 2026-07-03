import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { toast } from '@workspace/ui/hooks/use-toast'

import { urlFor } from '~/app/client'

import { AppModal } from '#common/ui/components/app_modal'
import { useTranslation } from '#common/ui/hooks/use_translation'
import UserFormFields, { type UserFormData } from '#users/ui/components/user_form_fields'
import { ROLES } from '#users/enums/role'

export default function CreateUserPage() {
  const { t } = useTranslation()

  const { data, setData, errors, post, progress, processing } = useForm<UserFormData>({
    fullName: '',
    email: '',
    role: ROLES.USER,
    password: '',
    passwordConfirmation: '',
  })

  return (
    <AppModal maxWidth="md">
      {({ close }) => (
        <div className="space-y-4">
          <header className="text-left space-y-1">
            <h2 className="text-lg font-semibold">{t('users.action.create.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('users.action.create.description')}
            </p>
          </header>

          <form
            id="create-user-form"
            onSubmit={(e) => {
              e.preventDefault()
              post(urlFor('users.store'), {
                preserveScroll: true,
                onSuccess: () => {
                  close()
                  toast(t('users.action.toast.title'), {
                    description: data.fullName || data.email,
                  })
                },
              })
            }}
          >
            <UserFormFields
              data={data}
              errors={errors}
              setData={(key, value) => setData(key, value as never)}
            />

            {progress && (
              <Progress
                value={progress.percentage}
                max={100}
                className="w-full h-2 rounded mt-4"
              />
            )}
          </form>

          <footer className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>
              {t('users.action.actions.cancel')}
            </Button>
            <Button type="submit" form="create-user-form" disabled={processing}>
              {t('users.action.actions.add')}
            </Button>
          </footer>
        </div>
      )}
    </AppModal>
  )
}
