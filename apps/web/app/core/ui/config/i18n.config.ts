import i18n from 'i18next'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'

import USERS_EN from '../../../users/resources/lang/en/users.json' with { type: 'json' }
import USERS_PT from '../../../users/resources/lang/pt/users.json' with { type: 'json' }

let i18nInstance: typeof i18n | null = null

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

  const config = {
    resources: {
      pt: {
        translation: {
          users: USERS_PT,
        },
      },
      en: {
        translation: {
          users: USERS_EN,
        },
      },
    },
    lng: locale,
    fallbackLng: fallbackLocale,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    load: 'currentOnly',
    returnNull: false,
    returnEmptyString: false,
    supportedLngs: ['pt', 'en'],
    react: {
      useSuspense: false,
    },
  } as const

  i18nInstance = i18n.createInstance().use(ICU).use(initReactI18next)

  i18nInstance.init(config)

  return i18nInstance
}

export const getI18nInstance = () => i18nInstance
