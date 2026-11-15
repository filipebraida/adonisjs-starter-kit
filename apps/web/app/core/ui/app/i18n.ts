import i18n, { type i18n as I18n, type Resource } from 'i18next'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'

type Messages = Record<string, unknown>

// One chunk per JSON file, loaded on demand: the browser downloads only the
// locales it shows. The namespace is the file name, as on the server
// (`auth/resources/lang/en/errors.json` → `errors.*`), so a key reads the same
// on both sides.
const localeFiles = import.meta.glob<Messages>('/app/*/resources/lang/*/*.json', {
  import: 'default',
})

const FILE_PATTERN = /\/resources\/lang\/([^/]+)\/([^/]+)\.json$/

function parse(path: string) {
  const match = path.match(FILE_PATTERN)
  return match ? { locale: match[1], namespace: match[2] } : null
}

export const supportedLocales = [
  ...new Set(Object.keys(localeFiles).flatMap((path) => parse(path)?.locale ?? [])),
]

/** Builds i18next resources from `{ path: messages }`, merging files that share a name. */
export function buildResources(files: Record<string, Messages>): Resource {
  const resources: Record<string, { translation: Record<string, Messages> }> = {}

  for (const [path, messages] of Object.entries(files)) {
    const parsed = parse(path)
    if (!parsed) continue

    resources[parsed.locale] ??= { translation: {} }
    const translation = resources[parsed.locale].translation
    translation[parsed.namespace] = { ...translation[parsed.namespace], ...messages }
  }

  return resources
}

/** Downloads the JSON files of the given locales. */
export async function loadResources(locales: string[]): Promise<Resource> {
  const wanted = Object.keys(localeFiles).filter((path) => {
    const locale = parse(path)?.locale
    return locale !== undefined && locales.includes(locale)
  })
  const loaded = await Promise.all(wanted.map(async (path) => [path, await localeFiles[path]()]))
  return buildResources(Object.fromEntries(loaded))
}

/** Loads a locale the instance does not have yet, before switching to it. */
export async function ensureLocale(instance: I18n, locale: string) {
  if (instance.hasResourceBundle(locale, 'translation')) return

  const resources = await loadResources([locale])
  const bundle = resources[locale]?.translation
  if (bundle) instance.addResourceBundle(locale, 'translation', bundle, true, true)
}

export function createI18n({
  locale,
  fallbackLocale = 'en',
  resources,
}: {
  locale: string
  fallbackLocale?: string
  resources: Resource
}) {
  const instance = i18n.createInstance().use(ICU).use(initReactI18next)

  instance.init({
    resources,
    lng: locale,
    fallbackLng: fallbackLocale,
    supportedLngs: supportedLocales,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    load: 'currentOnly',
    returnNull: false,
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  })

  return instance
}
