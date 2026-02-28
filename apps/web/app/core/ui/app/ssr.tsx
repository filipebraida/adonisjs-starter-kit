import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'
import { client } from './client'

import { I18nextProvider } from 'react-i18next'
import { setupI18n } from '../config/i18n.config'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const firstPart = name.split('/')[0]
      const rest = name.split('/').slice(1).join('/')

      const pages = import.meta.glob('/app/*/ui/pages/**/*.tsx', { eager: true })
      return pages[`/app/${firstPart}/ui/pages/${rest}.tsx`]
    },
    setup: ({ App, props }) => {
      const { locale, fallbackLocale } = props.initialPage.props as unknown as {
        locale?: string
        fallbackLocale?: string
      }

      const i18nInstance = setupI18n({
        locale: locale ?? 'en',
        fallbackLocale: fallbackLocale ?? 'en',
      })

      return (
        <I18nextProvider i18n={i18nInstance}>
          <TuyauProvider client={client}>
            <App {...props} />
          </TuyauProvider>
        </I18nextProvider>
      )
    },
  })
}
