import { defineConfig } from '@adonisjs/inertia'
import logger from '@adonisjs/core/services/logger'
import { isSSREnableForPage } from '#config/ssr'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  ssr: {
    enabled: true,
    entrypoint: 'app/core/ui/app/ssr.tsx',
    pages: (_, page) => {
      const ssrEnabled = isSSREnableForPage(page)
      logger.debug(`Page "${page}" SSR enabled: ${ssrEnabled}`)
      return ssrEnabled
    },
  },
})

export default inertiaConfig
