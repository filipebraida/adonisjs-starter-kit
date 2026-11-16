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

test.group('Help images', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    app.container.swap(HelpCatalog, () => HelpCatalog.at(FIXTURES))
    return () => app.container.restore(HelpCatalog)
  })

  test("serves a space's image to whom reads an article of it", async ({ client, assert }) => {
    const response = await client
      .get('/help/guide/images/shot.png')
      .loginAs(await reader(ROLES.USER))

    response.assertStatus(200)
    assert.include(response.header('content-type'), 'image/png')
    assert.equal(response.header('x-content-type-options'), 'nosniff')
  })

  test('an image only an article the reader may not read shows is a 404', async ({ client }) => {
    const user = await reader(ROLES.USER)

    const locked = await client.get('/help/guide/images/locked.png').loginAs(user).accept('json')
    locked.assertStatus(404)
    const shown = await client.get('/help/guide/images/shot.png').loginAs(user)
    shown.assertStatus(200)
  })

  test('an image is served to whom may read an article that shows it', async ({ client }) => {
    const response = await client
      .get('/help/guide/images/locked.png')
      .loginAs(await reader(ROLES.ADMIN))

    response.assertStatus(200)
  })

  test('an image no article shows is a 404, even to an admin', async ({ client }) => {
    const response = await client
      .get('/help/guide/images/orphan.png')
      .loginAs(await reader(ROLES.ADMIN))
      .accept('json')

    response.assertStatus(404)
  })

  test('a name outside the images, or not an image, is a 404', async ({ client }) => {
    const admin = await reader(ROLES.ADMIN)
    for (const file of ['..%2Findex.json', 'index.json', 'x.svg', 'missing.png']) {
      const response = await client.get(`/help/guide/images/${file}`).loginAs(admin).accept('json')
      response.assertStatus(404)
    }
  })

  test('a missing image is a bare 404, never a redirect', async ({ client, assert }) => {
    const response = await client
      .get('/help/guide/images/missing.png')
      .loginAs(await reader(ROLES.ADMIN))
      .header('accept', 'image/avif,image/webp,image/*,*/*;q=0.8')
      .redirects(0)

    response.assertStatus(404)
    assert.isUndefined(response.header('location'))
  })

  test('the images of a space the reader reads nothing of are a 404', async ({ client }) => {
    const response = await client
      .get('/help/vault/images/shot.png')
      .loginAs(await reader(ROLES.USER))
      .accept('json')

    response.assertStatus(404)
  })
})
