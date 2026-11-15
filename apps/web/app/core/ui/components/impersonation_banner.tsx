import { router } from '@inertiajs/react'
import { UserRoundSearch } from 'lucide-react'

import { urlFor } from '~/app/client'
import usePageProps from '#core/ui/hooks/use_page_props'
import useUser from '#core/ui/hooks/use_user'
import { useTranslation } from '#core/ui/hooks/use_translation'

/** In the page flow, not fixed: it never covers what the admin came to look at. */
export function ImpersonationBanner() {
  const { t } = useTranslation()
  const { impersonation } = usePageProps<{ impersonation: { returnTo: string } | null }>()
  const user = useUser()

  if (!impersonation || !user) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm">
      <span className="flex items-center gap-2">
        <UserRoundSearch className="size-4 shrink-0 text-warning-foreground" />
        <span className="font-medium">
          {t('core.impersonation.acting_as', { name: user.fullName ?? user.email })}
        </span>
      </span>
      <button
        type="button"
        onClick={() => router.delete(urlFor('users.impersonate.stop'))}
        className="cursor-pointer font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        {t('core.impersonation.return_as', { name: impersonation.returnTo })}
      </button>
    </div>
  )
}
