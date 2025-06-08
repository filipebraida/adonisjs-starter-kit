import i18n from 'i18next'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'

let i18nInstance: typeof i18n | null = null

const localeFiles = import.meta.glob('/app/**/resources/lang/*/*.json', {
  eager: true,
}) as Record<string, any>

function buildResources(): Record<string, any> {
  const resources: Record<string, any> = {}

  for (const path in localeFiles) {
    const match = path.match(/app\/([^/]+)\/resources\/lang\/([^/]+)\/([^/]+)\.json$/)
    if (!match) continue

    const [, moduleName, lang] = match
    const json = localeFiles[path].default ?? localeFiles[path]

    resources[lang] ??= { translation: {} }

    resources[lang].translation[moduleName] = {
      ...resources[lang].translation[moduleName],
      ...json,
    }
  }

  return resources
}

export const setupI18n = ({
  locale,
  fallbackLocale = 'en',
}: {
  locale: string
  fallbackLocale?: string
}) => {
  if (
    i18nInstance?.isInitialized &&
    i18nInstance.language === locale &&
    i18nInstance.options?.fallbackLng === fallbackLocale
  ) {
    return i18nInstance
  }

  const resources = buildResources()
  const supportedLngs = Object.keys(resources)

  console.log('i18n resources:', resources)

  const config = {
    resources,
    lng: locale,
    fallbackLng: fallbackLocale,
    supportedLngs,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    load: 'currentOnly',
    returnNull: false,
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  } as const

  i18nInstance = i18n.createInstance().use(ICU).use(initReactI18next)
  i18nInstance.init(config)

  return i18nInstance
}

export const getI18nInstance = () => i18nInstance
