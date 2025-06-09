import { useForm } from '@inertiajs/react'

import { Trans } from 'react-i18next'
import { UserIcon } from 'lucide-react'
import { toast } from '@workspace/ui/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'

import type UserDto from '#users/dtos/user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UserDto
}

export function UsersImpersonateDialog({ open, onOpenChange, currentRow }: Props) {
  const { post } = useForm()

  const { t } = useTranslation()

  const handleImpersonate = () => {
    post(`/users/impersonate/${currentRow?.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast(t('users.impersonate.toast.title'), {
          description: (
            <div className="mt-2 max-w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
              <pre className="text-white whitespace-pre-wrap break-words">
                <code>{JSON.stringify(currentRow, null, 2)}</code>
              </pre>
            </div>
          ),
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
                role: currentRow.role,
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
