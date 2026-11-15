import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import ResetPassword from '#auth/actions/reset_password'
import PasswordResetService from '#auth/services/password_reset_service'
import ResetPasswordToken from '#auth/models/reset_password_token'
import { UserFactory } from '#auth/database/factories/user'

test.group('ResetPassword', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('changes the password and invalidates the token', async ({ db, assert }) => {
    const user = await UserFactory.create()
    const { token } = await new PasswordResetService().generateToken(user)

    const result = await new ResetPassword().handle({
      token,
      password: 'nova-senha-123',
      ip: '127.0.0.1',
    })

    assert.isNotNull(result)
    assert.equal(result!.id, user.id)

    await user.refresh()
    assert.isNotNull(user.password)
    assert.isTrue(await hash.verify(user.password!, 'nova-senha-123'))

    await db.assertMissing('reset_password_tokens', { user_id: user.id })
  })

  test('returns null when the token does not exist', async ({ assert }) => {
    const result = await new ResetPassword().handle({
      token: 'token-inexistente',
      password: 'irrelevante',
      ip: '127.0.0.1',
    })

    assert.isNull(result)
  })

  test('returns null when the token is expired', async ({ assert }) => {
    const user = await UserFactory.create()
    const { token } = await new PasswordResetService().generateToken(user)

    await ResetPasswordToken.query()
      .where('userId', user.id)
      .update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() })

    const senhaOriginal = user.password

    const result = await new ResetPassword().handle({
      token,
      password: 'nova-senha-123',
      ip: '127.0.0.1',
    })

    assert.isNull(result)

    await user.refresh()
    assert.equal(user.password, senhaOriginal)
  })

  test('token can only be used once', async ({ assert }) => {
    const user = await UserFactory.create()
    const { token } = await new PasswordResetService().generateToken(user)

    const primeiro = await new ResetPassword().handle({
      token,
      password: 'senha-numero-1',
      ip: '127.0.0.1',
    })
    assert.isNotNull(primeiro)

    const segundo = await new ResetPassword().handle({
      token,
      password: 'senha-numero-2',
      ip: '127.0.0.1',
    })
    assert.isNull(segundo)

    await user.refresh()
    assert.isTrue(await hash.verify(user.password!, 'senha-numero-1'))
  })
})
