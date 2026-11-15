import app from '@adonisjs/core/services/app'
import { defineConfig, formatters, loaders } from '@adonisjs/i18n'

import { moduleDirs } from '#core/utils/module_dirs'

/**
 * Every module that has `resources/lang/` loads its translations, found at
 * boot like the frontend's glob, so a new module needs no wiring here. The
 * namespace is the file name: `auth/resources/lang/en/errors.json` → `errors.*`.
 */
const i18nConfig = defineConfig({
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt'],
  formatter: formatters.icu(),
  loaders: moduleDirs(app.makePath(), 'resources/lang').map((dir) =>
    loaders.fs({ location: app.makePath(dir) })
  ),
})

export default i18nConfig
