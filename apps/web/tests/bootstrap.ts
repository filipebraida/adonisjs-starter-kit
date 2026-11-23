import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import { fileSystem } from '@japa/file-system'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'

export const plugins: Config['plugins'] = [
  assert(),
  apiClient(),
  sessionApiClient(app),
  authApiClient(app),
  inertiaApiClient(app),
  shieldApiClient(),
  dbAssertions(app),
  pluginAdonisJS(app),
  // A temporary folder per test, removed even when the test fails.
  fileSystem(),
]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
