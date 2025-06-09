import { Button } from '@workspace/ui/components/button'
import { MailPlus, UserPlus } from 'lucide-react'

import { useUsers } from '#users/ui/context/users_context'
import { useTranslation } from '#common/ui/hooks/use_translation'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const { t } = useTranslation()

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="space-x-1" onClick={() => setOpen('invite')}>
        <span>{t('users.index.toolbar.invite')}</span> <MailPlus size={18} />
      </Button>
      <Button size="sm" className="space-x-1" onClick={() => setOpen('add')}>
        <span>{t('users.index.toolbar.add')}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
