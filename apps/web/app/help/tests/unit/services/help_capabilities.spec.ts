import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

import capabilities from '#config/capabilities'
import HelpCatalog from '#help/services/help_catalog'

test.group('Help capabilities', () => {
  test('every capability an index cites is one a role can be given', async ({ assert }) => {
    const catalog = await app.container.make(HelpCatalog)
    for (const capability of await catalog.capabilities()) {
      assert.include(capabilities.vocabulary, capability, `help cites an unknown capability`)
    }
  })
})
