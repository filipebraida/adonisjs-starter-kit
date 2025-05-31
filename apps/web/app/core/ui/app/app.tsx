/// <reference path="../../../../adonisrc.ts" />
/// <reference path="../../../../config/inertia.ts" />

import '../css/app.css'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@tuyau/inertia/react'
import { tuyau } from './tuyau'

import { isSSREnableForPage } from 'config/ssr'

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

  setup({ el, App, props }) {
    const componentName = props.initialPage.component
    const isSSREnabled = isSSREnableForPage(componentName)

    if (isSSREnabled) {
      hydrateRoot(
        el,
        <TuyauProvider client={tuyau}>
          <App {...props} />
        </TuyauProvider>
      )
    } else {
      createRoot(el).render(
        <TuyauProvider client={tuyau}>
          <App {...props} />
        </TuyauProvider>
      )
    }
  },
})
