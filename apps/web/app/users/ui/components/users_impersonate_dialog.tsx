import { useForm } from '@inertiajs/react'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { toast } from '@workspace/ui/hooks/use-toast'
import { UserIcon } from 'lucide-react'
import { Trans } from 'react-i18next'

import type { Data } from '@generated/data'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Data.Users.User
}

export function UsersImpersonateDialog({ open, onOpenChange, currentRow }: Props) {
  const { post } = useForm()

  const { t } = useTranslation()

  const handleImpersonate = () => {
    post(urlFor('users.impersonate.handle', { id: currentRow.id }), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast(t('users.impersonate.toast.title'), {
          description: currentRow.email,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleImpersonate}
      title={
        <span className="flex items-center gap-2">
          <UserIcon className="mr-1 inline-block" size={18} />
          <span>{t('users.impersonate.title')}</span>
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <Trans
              i18nKey="users.impersonate.description"
              values={{
                email: currentRow.email,
                role: t(`users.roles.${currentRow.roleId}.name`),
              }}
              components={{
                strong1: <span className="font-bold" />,
                strong2: <span className="font-bold" />,
              }}
            />
          </p>

          <Alert>
            <AlertTitle>{t('users.impersonate.alert.title')}</AlertTitle>
            <AlertDescription>{t('users.impersonate.alert.description')}</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('users.impersonate.confirm_button')}
    />
  )
}
