/** The languages the help is written in: the interface's. */
export const HELP_LOCALES = ['pt', 'en'] as const
export type HelpLocale = (typeof HELP_LOCALES)[number]

/** The help's language for an interface locale: English when it is English, else Portuguese. */
export function helpLocaleOf(locale: string): HelpLocale {
  return locale === 'en' ? 'en' : 'pt'
}
