import type { TFunction as I18nextTFunction } from 'i18next'
import { useTranslation as useReactI18nextTranslation } from 'react-i18next'

/** `t` with its keys typed from the English JSON files (`.adonisjs/client/i18n.d.ts`). */
export type TFunction = I18nextTFunction

interface I18nService {
  t: TFunction
  changeLanguage: (lang: string) => Promise<void>
  language: string
}

export function useTranslation(): I18nService {
  const { t, i18n } = useReactI18nextTranslation()

  return {
    t,
    changeLanguage: async (lang: string) => {
      if (i18n.language !== lang) {
        // Imported here, not at the top: the locale loader uses Vite's
        // import.meta.glob, and a component rendered outside Vite (a unit spec)
        // must be able to use this hook.
        const { ensureLocale } = await import('#core/ui/app/i18n')
        await ensureLocale(i18n, lang)
        await i18n.changeLanguage(lang)
      }
    },
    language: i18n.language,
  }
}
