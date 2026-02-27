import { defineConfig } from '@adonisjs/inertia'
import logger from '@adonisjs/core/services/logger'
import { isSSREnableForPage } from '#config/ssr'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Options for the server-side rendering
   */
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
