import { useState } from 'react'
import { useAuthz } from '@adonis-agora/authz-react'
import { KeyRound, Pencil } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { KeyValue, KeyValueList } from '@workspace/ui/components/key-value'

import { UserAvatar } from '#core/ui/components/user_avatar'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { PasswordForm } from '#users/ui/components/password_form'
import { ProfileForm } from '#users/ui/components/profile_form'
import { roleLabel } from '#users/ui/components/users_types'

import { displayRole } from '#auth/enums/role'

import type { Data } from '@generated/data'

/** Esc in any field cancels the edit, as the Cancel button does. */
function Editing({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      {children}
    </div>
  )
}

/** The signed-in user's data: read until they ask to edit it; "Edit" opens the form in place. */
export function ProfileSection({ user }: { user: Data.Users.User.Variants['forProfile'] }) {
  const { t } = useTranslation()
  const { roles } = useAuthz()
  const [editing, setEditing] = useState(false)
  const role = displayRole(roles)

  if (editing) {
    return (
      <Editing onClose={() => setEditing(false)}>
        <ProfileForm user={user} onClose={() => setEditing(false)} />
      </Editing>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <UserAvatar user={user} className="size-16" />
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil data-icon="inline-start" />
          {t('users.profile.edit')}
        </Button>
      </div>
      <KeyValueList>
        <KeyValue label={t('users.profile.name')}>
          {user.fullName ?? (
            <span className="text-muted-foreground">{t('users.profile.not_set')}</span>
          )}
        </KeyValue>
        <KeyValue label={t('users.profile.email')}>{user.email}</KeyValue>
        <KeyValue label={t('users.profile.role')}>
          {role ? (
            roleLabel(t, role)
          ) : (
            <span className="text-muted-foreground">{t('users.profile.no_role')}</span>
          )}
        </KeyValue>
      </KeyValueList>
    </div>
  )
}

/** The signed-in user's password: never shown; "Change password" opens the form in place. */
export function PasswordSection() {
  const { t } = useTranslation()
  const [changing, setChanging] = useState(false)

  if (changing) {
    return (
      <Editing onClose={() => setChanging(false)}>
        <PasswordForm onClose={() => setChanging(false)} />
      </Editing>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{t('users.password.hint')}</p>
      <Button variant="outline" size="sm" onClick={() => setChanging(true)}>
        <KeyRound data-icon="inline-start" />
        {t('users.password.change')}
      </Button>
    </div>
  )
}
