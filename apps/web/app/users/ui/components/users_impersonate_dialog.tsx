import { useForm } from '@inertiajs/react'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { UserIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { toast } from '@workspace/ui/hooks/use-toast'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

import { ROLES, mainRole } from '#users/enums/role'

import type { Data } from '@generated/data'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Data.Users.User.Variants['forList']
}

export function UsersImpersonateDialog({ open, onOpenChange, currentRow }: Props) {
  const { post, processing } = useForm()
  const { t } = useTranslation()

  const roleName = t(`users.roles.${mainRole(currentRow.roles) ?? ROLES.USER}.name`)

  const handleImpersonate = () => {
    post(urlFor('users.impersonate.handle', { id: currentRow.id }), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast(t('users.impersonate.toast.title'), { description: currentRow.email })
      },
    })
  }

  const title = useMemo(
    () => (
      <span className="flex items-center gap-2">
        <UserIcon className="mr-1 inline-block" size={18} />
        <span>{t('users.impersonate.title')}</span>
      </span>
    ),
    [t]
  )

  const desc = useMemo(
    () => (
      <div className="space-y-4">
        <p className="mb-2">
          <Trans
            i18nKey="users.impersonate.description"
            values={{ email: currentRow.email, role: roleName }}
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
    ),
    [t, currentRow.email, roleName]
  )

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleImpersonate}
      isLoading={processing}
      title={title}
      desc={desc}
      confirmText={t('users.impersonate.confirm_button')}
    />
  )
}
