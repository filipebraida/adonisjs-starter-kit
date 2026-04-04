import { useForm } from '@inertiajs/react'
import { useState } from 'react'

import { Trans } from 'react-i18next'

import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Input } from '@workspace/ui/components/input'
import { toast } from '@workspace/ui/hooks/use-toast'
import { AlertTriangleIcon } from 'lucide-react'

import type { Data } from '@generated/data'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Data.Users.User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { delete: destroy } = useForm()

  const { t } = useTranslation()

  const handleDelete = () => {
    if (value.trim() !== currentRow.email) return

    destroy(urlFor('users.destroy', { id: currentRow.id }), {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        toast(t('users.delete.toast.title'), {
          description: currentRow.email,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email}
      title={
        <span className="text-destructive flex items-center gap-2">
          <AlertTriangleIcon className="mr-1 inline-block stroke-destructive" size={18} />
          <span>{t('users.delete.title')}</span>
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            <Trans
              i18nKey="users.delete.description"
              values={{ email: currentRow.email, role: t(`users.roles.${currentRow.roleId}.name`) }}
              components={{
                strong1: <span className="font-bold" />,
                strong2: <span className="font-bold" />,
              }}
            />
          </p>

          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('users.delete.confirm_placeholder')}
          />

          <Alert variant="destructive">
            <AlertTitle>{t('users.delete.alert.title')}</AlertTitle>
            <AlertDescription>{t('users.delete.alert.description')}</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('users.delete.confirm_button')}
      destructive
    />
  )
}
