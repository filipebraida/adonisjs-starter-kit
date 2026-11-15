import { MailPlus, UserPlus } from 'lucide-react'
import { ModalLink } from 'adonis-inertia-modal/react'

import { buttonVariants } from '@workspace/ui/components/button'

import { urlFor } from '~/app/client'
import { useTranslation } from '#core/ui/hooks/use_translation'
import type { UsersPagePermissions } from '#users/ui/components/users_types'

export function UsersPrimaryButtons({ can }: Pick<UsersPagePermissions, 'can'>) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2">
      {can.invite && (
        <ModalLink
          href={urlFor('users.invite.show')}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <span>{t('users.index.toolbar.invite')}</span>
          <MailPlus size={18} />
        </ModalLink>
      )}
      {can.create && (
        <ModalLink href={urlFor('users.create')} className={buttonVariants({ size: 'sm' })}>
          <span>{t('users.index.toolbar.add')}</span>
          <UserPlus size={18} />
        </ModalLink>
      )}
    </div>
  )
}
