import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { returnToKey } from '#auth/middleware/auth_middleware'
import { UserFactory } from '#auth/database/factories/user'

const email = 'alice@example.test'
const password = 'senha-secreta-123'

test.group('Endpoint /login', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('establishes an authenticated session with valid credentials', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    // Session key `auth_web` holds the user id: that's what the guard reads on subsequent requests.
    assert.equal(response.session().auth_web, user.id)
  })

  test('honors a safe internal returnTo stored in the session', async ({ client, assert }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .withSession({ [returnToKey]: '/settings' })
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/settings')
  })

  test('discards returnTo with an external URL and falls back to the dashboard', async ({
    client,
    assert,
  }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .withSession({ [returnToKey]: 'http://evil.example/steal' })
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
  })

  test('invalid credentials: does not establish a session', async ({ client, assert }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password: 'senha-errada' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
    assert.isUndefined(response.session().auth_web)
  })

  test('rejects a payload without email/password', async ({ client }) => {
    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({})

    response.assertStatus(422)
  })

  test('syncs the user-locale cookie from user.locale on login', async ({ client }) => {
    await UserFactory.merge({ email, password, locale: 'pt' }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password })

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')
  })
})
