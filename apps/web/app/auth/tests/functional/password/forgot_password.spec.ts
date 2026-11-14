import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ResetPasswordToken from '#auth/models/reset_password_token'
import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint /forgot-password', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('gera token e emite evento para email cadastrado', async ({ client, assert }) => {
    using fake = emitter.fake(['auth:forgot_password'])
    const user = await UserFactory.create()

    const response = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .json({ email: user.email })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')

    fake.assertEmitted('auth:forgot_password')

    const token = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()
    assert.isNotEmpty(token.token)
  })

  test('nao vaza usuario quando email nao existe (mesmo status/redirect)', async ({
    client,
    assert,
  }) => {
    using fake = emitter.fake(['auth:forgot_password'])
    const response = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .json({ email: 'nao-existe@example.test' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')

    fake.assertNoneEmitted()
  })

  test('rejeita email malformado', async ({ client }) => {
    const response = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ email: 'nao-eh-email' })

    response.assertStatus(422)
  })
})
