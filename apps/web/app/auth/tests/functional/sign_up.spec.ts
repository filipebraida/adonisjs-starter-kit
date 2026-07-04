import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'
import User from '#users/models/user'

const payload = {
  fullName: 'Novo Usuario',
  email: 'novo-signup@example.test',
  password: 'senha-inicial-123',
  passwordConfirmation: 'senha-inicial-123',
}

test.group('Endpoint /sign-up', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('cria usuario, autentica e redireciona para /dashboard', async ({ client, db, assert }) => {
    const response = await client.post('/sign-up').redirects(0).withCsrfToken().json(payload)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    await db.assertHas('users', { email: payload.email, full_name: payload.fullName })

    const user = await User.findByOrFail('email', payload.email)
    assert.isNotNull(user.password)
    assert.notEqual(user.password, payload.password)
    assert.equal(response.session().auth_web, user.id)
  })

  test('rejeita email ja cadastrado e mantem apenas o user original', async ({
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

  test('rejeita senha curta e nao persiste usuario', async ({ client, db, assert }) => {
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

  test('rejeita quando password_confirmation nao bate e nao persiste', async ({
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
})
