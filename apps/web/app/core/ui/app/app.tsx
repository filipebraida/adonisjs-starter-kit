/// <reference path="../../../../adonisrc.ts" />
/// <reference path="../../../../config/inertia.ts" />

import '../css/app.css'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@tuyau/inertia/react'
import { tuyau } from './tuyau'

import { isSSREnableForPage } from 'config/ssr'
import { setupI18n } from '../config/i18n.config'
import { I18nextProvider } from 'react-i18next'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS Starter Kit'

createInertiaApp({
  progress: { color: 'black' },

  title: (title) => (title ? `${title} - ${appName}` : appName),

  resolve: (name) => {
    const firstPart = name.split('/')[0]
    const rest = name.split('/').slice(1).join('/')
    return resolvePageComponent(
      `/app/${firstPart}/ui/pages/${rest}.tsx`,
      import.meta.glob('/app/*/ui/pages/**/*.tsx')
    )
  },

  setup: ({ el, App, props }) => {
    const componentName = props.initialPage.component
    const isSSREnabled = isSSREnableForPage(componentName)

    const { locale, fallbackLocale } = props.initialPage.props as unknown as {
      locale: string
      fallbackLocale?: string
    }

    const i18nInstance = setupI18n({ locale, fallbackLocale })

    if (isSSREnabled) {
      hydrateRoot(
        el,
        <I18nextProvider i18n={i18nInstance}>
          <TuyauProvider client={tuyau}>
            <App {...props} />
          </TuyauProvider>
        </I18nextProvider>
      )
    } else {
      createRoot(el).render(
        <I18nextProvider i18n={i18nInstance}>
          <TuyauProvider client={tuyau}>
            <App {...props} />
          </TuyauProvider>
        </I18nextProvider>
      )
    }
  },
})
