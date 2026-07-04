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

  test('cria usuario, autentica e redireciona para /dashboard', async ({ client, assert }) => {
    const response = await client.post('/sign-up').redirects(0).withCsrfToken().json(payload)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    const user = await User.findByOrFail('email', payload.email)
    assert.equal(user.fullName, payload.fullName)
    assert.isNotNull(user.password)
    assert.notEqual(user.password, payload.password)
    assert.equal(response.session().auth_web, user.id)
  })

  test('rejeita email ja cadastrado e mantem apenas o user original', async ({
    client,
    assert,
  }) => {
    const original = await UserFactory.merge({ email: payload.email }).create()

    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json(payload)

    response.assertStatus(422)
    const rows = await User.query().where('email', payload.email)
    assert.lengthOf(rows, 1)
    assert.equal(rows[0].id, original.id)
    assert.isUndefined(response.session().auth_web)
  })

  test('rejeita senha curta e nao persiste usuario', async ({ client, assert }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, password: 'curta', passwordConfirmation: 'curta' })

    response.assertStatus(422)
    assert.isNull(await User.findBy('email', payload.email))
    assert.isUndefined(response.session().auth_web)
  })

  test('rejeita quando password_confirmation nao bate e nao persiste', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, passwordConfirmation: 'diferente-1234' })

    response.assertStatus(422)
    assert.isNull(await User.findBy('email', payload.email))
    assert.isUndefined(response.session().auth_web)
  })
})
