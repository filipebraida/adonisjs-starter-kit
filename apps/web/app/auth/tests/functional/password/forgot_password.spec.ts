import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ResetPasswordToken from '#auth/models/reset_password_token'
import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint /forgot-password', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('generates a token and emits the event for a registered email', async ({
    client,
    assert,
  }) => {
    using fake = emitter.fake(['auth:forgot_password'])
    const user = await UserFactory.create()

    const response = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .json({ email: user.email })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/forgot-password')

    fake.assertEmitted('auth:forgot_password')

    const token = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()
    assert.isNotEmpty(token.token)
  })

  test('answers an unknown e-mail exactly as a registered one, and sends nothing', async ({
    client,
    assert,
  }) => {
    using fake = emitter.fake(['auth:forgot_password'])
    const user = await UserFactory.create()

    const known = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .json({ email: user.email })
    fake.assertEmittedCount('auth:forgot_password', 1)

    const unknown = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .json({ email: 'missing@example.test' })

    fake.assertEmittedCount('auth:forgot_password', 1)
    assert.equal(unknown.status(), known.status())
    assert.equal(unknown.header('location'), known.header('location'))
    assert.isString(unknown.flashMessages().success)
    assert.equal(unknown.flashMessages().success, known.flashMessages().success)
  })

  test('rejects a malformed email', async ({ client }) => {
    const response = await client
      .post('/forgot-password')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ email: 'not-an-email' })

    response.assertStatus(422)
  })
})
