import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import HelpCatalog from '#help/services/help_catalog'
import { withRole } from '#tests/helpers/rbac'

const BROKEN = new URL('../../fixtures/broken', import.meta.url).pathname

test.group('Help in every page', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    app.container.swap(HelpCatalog, () => HelpCatalog.at(BROKEN))
    return () => app.container.restore(HelpCatalog)
  })

  test('a broken help index leaves the other screens up, with no "?"', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/settings').loginAs(user).withInertia().redirects(0)

    response.assertStatus(200)
    response.assertInertiaComponent('users/settings')
    assert.deepEqual(response.inertiaProps.helpArticles, [])
  })
})
