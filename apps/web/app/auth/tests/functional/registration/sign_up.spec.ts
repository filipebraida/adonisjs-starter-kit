import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import User from '#auth/models/user'

const payload = {
  fullName: 'Novo Usuario',
  email: 'novo-signup@example.test',
  password: 'senha-inicial-123',
  passwordConfirmation: 'senha-inicial-123',
}

test.group('Endpoint /sign-up', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('creates the user, authenticates and redirects to /dashboard', async ({
    client,
    db,
    assert,
  }) => {
    const response = await client.post('/sign-up').redirects(0).withCsrfToken().json(payload)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    await db.assertHas('users', { email: payload.email, full_name: payload.fullName })

    const user = await User.findByOrFail('email', payload.email)
    assert.isNotNull(user.password)
    assert.notEqual(user.password, payload.password)
    assert.equal(response.session().auth_web, user.id)
  })

  test('rejects an already registered email and keeps only the original user', async ({
    client,
    db,
    assert,
  }) => {
    await UserFactory.merge({ email: payload.email }).create()

    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json(payload)

    response.assertStatus(422)
    await db.assertHas('users', { email: payload.email }, 1)
    assert.isUndefined(response.session().auth_web)
  })

  test('rejects a short password and does not persist the user', async ({ client, db, assert }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, password: 'curta', passwordConfirmation: 'curta' })

    response.assertStatus(422)
    await db.assertMissing('users', { email: payload.email })
    assert.isUndefined(response.session().auth_web)
  })

  test('rejects when password_confirmation does not match and does not persist', async ({
    client,
    db,
    assert,
  }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, passwordConfirmation: 'diferente-1234' })

    response.assertStatus(422)
    await db.assertMissing('users', { email: payload.email })
    assert.isUndefined(response.session().auth_web)
  })

  test('captures the current locale and persists it in user.locale', async ({ client, assert }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .header('X-User-Language', 'pt')
      .json(payload)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')

    const user = await User.findByOrFail('email', payload.email)
    assert.equal(user.locale, 'pt')
  })
})
