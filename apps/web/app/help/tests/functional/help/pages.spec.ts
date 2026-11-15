import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import HelpCatalog from '#help/services/help_catalog'
import type { ArticleProps } from '#help/tests/helpers/article_props'
import { withRole } from '#tests/helpers/rbac'

const FIXTURES = new URL('../../fixtures/app', import.meta.url).pathname
const MISSING = new URL('../../fixtures/missing', import.meta.url).pathname

// The fixtures: space "guide" with "start" (open) and "locked" (users.view_list),
// space "vault" with only "secret" (users.view_list). An admin reads all three,
// a plain user only guide/start.
async function reader(role: string) {
  const user = await UserFactory.create()
  await withRole(user, role)
  return user
}

test.group('Help pages', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    app.container.swap(HelpCatalog, () => HelpCatalog.at(FIXTURES))
    return () => app.container.restore(HelpCatalog)
  })

  test('without a session, the help goes to sign in', async ({ client, assert }) => {
    for (const url of ['/help', '/help/guide', '/help/guide/start']) {
      const response = await client.get(url).redirects(0)
      response.assertStatus(302)
      assert.equal(response.header('location'), '/login', url)
    }
  })

  test('the entry lists the readable spaces and their articles', async ({ client, assert }) => {
    const response = await client
      .get('/help')
      .loginAs(await reader(ROLES.ADMIN))
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('help/help/index')
    const spaces = response.inertiaProps.spaces as {
      slug: string
      title: string
      articles: { slug: string }[]
    }[]
    assert.deepEqual(
      spaces.map((space) => space.slug),
      ['guide', 'vault']
    )
    assert.equal(spaces[0].title, 'Guide')
    assert.deepEqual(
      spaces[0].articles.map((article) => article.slug),
      ['start', 'locked']
    )
  })

  test('with one readable space, the entry opens it', async ({ client, assert }) => {
    const response = await client
      .get('/help')
      .loginAs(await reader(ROLES.USER))
      .redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/help/guide')
  })

  test('a space opens on its first article, with its sections', async ({ client, assert }) => {
    const response = await client
      .get('/help/guide')
      .loginAs(await reader(ROLES.ADMIN))
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('help/help/show')
    const props = response.inertiaProps as unknown as ArticleProps
    assert.equal(props.article.slug, 'start')
    assert.isNotEmpty(props.markdown)
    assert.isNotEmpty(props.sections)
    assert.equal(props.next?.slug, 'locked')
  })

  test("a reader without the capability does not see the article in the space's navigation", async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/help/guide/start')
      .loginAs(await reader(ROLES.USER))
      .withInertia()

    const props = response.inertiaProps as unknown as ArticleProps
    assert.deepEqual(
      props.navigation.flatMap((category) => category.articles.map((article) => article.slug)),
      ['start']
    )
    assert.isNull(props.next)
  })

  test('the article comes in the reader language', async ({ client, assert }) => {
    const response = await client
      .get('/help/guide/start')
      .loginAs(await reader(ROLES.USER))
      .header('X-User-Language', 'pt')
      .withInertia()

    const props = response.inertiaProps as unknown as ArticleProps
    assert.equal(props.article.title, 'Começar')
  })

  test('a hidden article answers exactly as a missing one', async ({ client, assert }) => {
    const user = await reader(ROLES.USER)

    for (const url of ['/help/guide/locked', '/help/vault/secret']) {
      const json = await client.get(url).loginAs(user).accept('json')
      json.assertStatus(404)
    }
    const hidden = await client
      .get('/help/guide/locked')
      .loginAs(user)
      .header('referer', '/help/guide/start')
      .redirects(0)
    const missing = await client
      .get('/help/guide/nothing')
      .loginAs(user)
      .header('referer', '/help/guide/start')
      .redirects(0)

    hidden.assertStatus(302)
    missing.assertStatus(302)
    assert.equal(hidden.header('location'), missing.header('location'))
    hidden.assertFlashMessage('error', 'This help article does not exist.')
    missing.assertFlashMessage('error', 'This help article does not exist.')
  })

  test('a missing space or article is a 404 to a JSON request', async ({ client }) => {
    const admin = await reader(ROLES.ADMIN)
    for (const url of ['/help/nowhere', '/help/guide/nothing']) {
      const response = await client.get(url).loginAs(admin).accept('json')
      response.assertStatus(404)
    }
  })

  test('an article missing in the reader language answers as a missing one', async ({ client }) => {
    app.container.swap(HelpCatalog, () => HelpCatalog.at(MISSING))
    const user = await reader(ROLES.USER)

    const pt = await client
      .get('/help/guide/start')
      .loginAs(user)
      .header('X-User-Language', 'pt')
      .accept('json')
    const en = await client
      .get('/help/guide/start')
      .loginAs(user)
      .header('X-User-Language', 'en')
      .withInertia()

    pt.assertStatus(404)
    en.assertStatus(200)
  })
})
