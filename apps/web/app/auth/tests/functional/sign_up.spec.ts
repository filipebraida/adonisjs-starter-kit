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

  test('cria usuario e redireciona para /dashboard', async ({ client, assert }) => {
    const response = await client.post('/sign-up').redirects(0).withCsrfToken().json(payload)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    const user = await User.findByOrFail('email', payload.email)
    assert.equal(user.fullName, payload.fullName)
    assert.isNotNull(user.password)
    assert.notEqual(user.password, payload.password)
  })

  test('rejeita email ja cadastrado', async ({ client }) => {
    await UserFactory.merge({ email: payload.email }).create()

    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json(payload)

    response.assertStatus(422)
  })

  test('rejeita senha curta', async ({ client }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, password: 'curta', passwordConfirmation: 'curta' })

    response.assertStatus(422)
  })

  test('rejeita quando password_confirmation nao bate', async ({ client }) => {
    const response = await client
      .post('/sign-up')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ ...payload, passwordConfirmation: 'diferente-1234' })

    response.assertStatus(422)
  })
})
