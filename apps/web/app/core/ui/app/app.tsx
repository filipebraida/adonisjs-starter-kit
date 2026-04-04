import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp } from '@inertiajs/react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { TooltipProvider } from '@workspace/ui/components/tooltip'
import '../css/app.css'
import { client } from './client'

import { isSSREnableForPage } from 'config/ssr'
import { I18nextProvider } from 'react-i18next'
import { setupI18n } from '../config/i18n.config'

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
      locale?: string
      fallbackLocale?: string
    }

    const i18nInstance = setupI18n({
      locale: locale ?? 'en',
      fallbackLocale: fallbackLocale ?? 'en',
    })

    if (isSSREnabled) {
      hydrateRoot(
        el,
        <I18nextProvider i18n={i18nInstance}>
          <TooltipProvider>
            <TuyauProvider client={client}>
              <App {...props} />
            </TuyauProvider>
          </TooltipProvider>
        </I18nextProvider>
      )
    } else {
      createRoot(el).render(
        <I18nextProvider i18n={i18nInstance}>
          <TooltipProvider>
            <TuyauProvider client={client}>
              <App {...props} />
            </TuyauProvider>
          </TooltipProvider>
        </I18nextProvider>
      )
    }
  },
})
