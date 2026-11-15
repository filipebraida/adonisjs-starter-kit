import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint POST /switch/:locale', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('sets the user-locale cookie for a supported locale (pt)', async ({ client, assert }) => {
    const response = await client
      .post('/switch/pt')
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    response.assertCookie('user-locale', 'pt')
  })

  test('accepts en too', async ({ client }) => {
    const response = await client
      .post('/switch/en')
      .withCsrfToken()
      .header('referer', '/')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'en')
  })

  test('rejects an unsupported locale (does not overwrite with xx)', async ({ client }) => {
    const response = await client
      .post('/switch/xx')
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'en')
  })

  test('without referer redirects to /', async ({ client, assert }) => {
    const response = await client.post('/switch/pt').withCsrfToken().redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })

  test('authenticated user has the locale saved on the user', async ({ client, assert }) => {
    const user = await UserFactory.merge({ locale: null }).create()

    const response = await client
      .post('/switch/pt')
      .loginAs(user)
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')

    await user.refresh()
    assert.equal(user.locale, 'pt')
  })

  test('anonymous user does not persist to a user (only sets the cookie)', async ({ client }) => {
    const response = await client
      .post('/switch/pt')
      .withCsrfToken()
      .header('referer', '/')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')
  })
})
