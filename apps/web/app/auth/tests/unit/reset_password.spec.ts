import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import ResetPassword from '#auth/actions/reset_password'
import PasswordResetService from '#users/services/password_reset_service'
import ResetPasswordToken from '#users/models/reset_password_token'
import { UserFactory } from '#users/database/factories/user'

test.group('ResetPassword', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('troca a senha e invalida o token', async ({ assert }) => {
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

    const restante = await ResetPasswordToken.query().where('userId', user.id).first()
    assert.isNull(restante)
  })

  test('retorna null quando o token nao existe', async ({ assert }) => {
    const result = await new ResetPassword().handle({
      token: 'token-inexistente',
      password: 'irrelevante',
      ip: '127.0.0.1',
    })

    assert.isNull(result)
  })

  test('retorna null quando o token esta expirado', async ({ assert }) => {
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

  test('token so pode ser usado uma vez', async ({ assert }) => {
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
