/** The languages the help is written in: the interface's. */
export const HELP_LOCALES = ['pt', 'en'] as const
export type HelpLocale = (typeof HELP_LOCALES)[number]

/**
 * The help's language for an interface locale: Portuguese for Portuguese
 * (`pt`, `pt-BR`), else English, the app's default locale. A locale added
 * before its articles are written reads them in English.
 */
export function helpLocaleOf(locale: string): HelpLocale {
  return locale === 'pt' || locale.startsWith('pt-') ? 'pt' : 'en'
}
