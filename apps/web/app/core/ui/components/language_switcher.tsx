import { Globe } from 'lucide-react'

import usePageProps from '#core/ui/hooks/use_page_props'
import { useSwitchLocale } from '#core/ui/hooks/use_switch_locale'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
] as const

export function LanguageSwitcher() {
  const { locale } = usePageProps<{ locale: string }>()
  const switchLocale = useSwitchLocale()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="size-4" />
          <span className="sr-only">{t('core.layout.switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ code, label }) => (
          <DropdownMenuItem key={code} onClick={() => switchLocale(code)}>
            <span className={locale === code ? 'font-semibold' : undefined}>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
