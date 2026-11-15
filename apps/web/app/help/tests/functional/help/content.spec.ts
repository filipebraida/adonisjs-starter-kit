import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import HelpCatalog from '#help/services/help_catalog'
import { withRole } from '#tests/helpers/rbac'

const FIXTURES = new URL('../../fixtures/app', import.meta.url).pathname

async function reader(role: string) {
  const user = await UserFactory.create()
  await withRole(user, role)
  return user
}

test.group('Help article content', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    app.container.swap(HelpCatalog, () => HelpCatalog.at(FIXTURES))
    return () => app.container.restore(HelpCatalog)
  })

  test("the drawer gets the article as JSON, with its images' address", async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/help/guide/locked/content')
      .loginAs(await reader(ROLES.ADMIN))
      .accept('json')

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.article.slug, 'locked')
    assert.isNotEmpty(body.markdown)
    assert.equal(body.imagesUrl, '/help/guide/images')
    assert.properties(body, ['space', 'sections', 'previous', 'next'])
  })

  test('an article the reader may not read is a 404', async ({ client }) => {
    const response = await client
      .get('/help/guide/locked/content')
      .loginAs(await reader(ROLES.USER))
      .accept('json')

    response.assertStatus(404)
  })

  test('without a session it goes to sign in', async ({ client }) => {
    const response = await client.get('/help/guide/start/content').redirects(0)
    response.assertStatus(302)
  })
})
