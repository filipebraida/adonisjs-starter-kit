import { router } from '@inertiajs/react'

import { urlFor } from '~/app/client'
import { useTranslation } from '#core/ui/hooks/use_translation'

/** Switches the interface's language: kept on the account (or a cookie when signed out), then applied. */
export function useSwitchLocale() {
  const { changeLanguage } = useTranslation()

  return (code: string) =>
    router.post(
      urlFor('locale.switch', { locale: code }),
      {},
      { preserveScroll: true, onSuccess: () => changeLanguage(code) }
    )
}
