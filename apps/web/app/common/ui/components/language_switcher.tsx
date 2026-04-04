import { Globe } from 'lucide-react'
import { router } from '@inertiajs/react'

import { urlFor } from '~/app/client'
import usePageProps from '#common/ui/hooks/use_page_props'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
] as const

export function LanguageSwitcher() {
  const { locale } = usePageProps<{ locale: string }>()
  const { changeLanguage } = useTranslation()

  function switchLocale(code: string) {
    router.post(urlFor('locale.switch', { locale: code }), {}, {
      onSuccess: () => changeLanguage(code),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className={locale === code ? 'font-semibold' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
