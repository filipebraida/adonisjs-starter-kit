import { existsSync, readdirSync } from 'node:fs'

import app from '@adonisjs/core/services/app'
import { defineConfig, formatters, loaders } from '@adonisjs/i18n'

/**
 * Every module that has `resources/lang/` loads its translations, found at
 * boot like the frontend's glob, so a new module needs no wiring here. The
 * namespace is the file name: `auth/resources/lang/en/errors.json` → `errors.*`.
 */
const moduleLangDirs = readdirSync(app.makePath('app'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => app.makePath('app', entry.name, 'resources/lang'))
  .filter((location) => existsSync(location))

const i18nConfig = defineConfig({
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt'],
  formatter: formatters.icu(),
  loaders: moduleLangDirs.map((location) => loaders.fs({ location })),
})

export default i18nConfig
