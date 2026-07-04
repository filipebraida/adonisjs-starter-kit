import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import PasswordResetService from '#users/services/password_reset_service'
import ResetPasswordToken from '#users/models/reset_password_token'
import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint /reset-password/:token', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('POST valido troca a senha e redireciona para /login', async ({ client, db, assert }) => {
    const user = await UserFactory.create()
    const { token } = await new PasswordResetService().generateToken(user)

    const response = await client
      .post(`/reset-password/${token}`)
      .redirects(0)
      .withCsrfToken()
      .json({ password: 'senha-nova-456', passwordConfirmation: 'senha-nova-456' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')

    await user.refresh()
    assert.isTrue(await hash.verify(user.password!, 'senha-nova-456'))

    await db.assertMissing('reset_password_tokens', { user_id: user.id })
  })

  test('POST com token invalido nao muda senha e volta para /forgot-password', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const senhaOriginal = user.password

    const response = await client
      .post('/reset-password/token-que-nao-existe')
      .redirects(0)
      .withCsrfToken()
      .json({ password: 'senha-nova-456', passwordConfirmation: 'senha-nova-456' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/forgot-password')

    await user.refresh()
    assert.equal(user.password, senhaOriginal)
  })

  test('POST com token expirado nao muda senha nem consome o token', async ({
    client,
    db,
    assert,
  }) => {
    const user = await UserFactory.create()
    const senhaOriginal = user.password
    const { token } = await new PasswordResetService().generateToken(user)

    await ResetPasswordToken.query()
      .where('userId', user.id)
      .update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() })

    const response = await client
      .post(`/reset-password/${token}`)
      .redirects(0)
      .withCsrfToken()
      .json({ password: 'senha-nova-456', passwordConfirmation: 'senha-nova-456' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/forgot-password')

    await user.refresh()
    assert.equal(user.password, senhaOriginal)
    await db.assertHas('reset_password_tokens', { user_id: user.id })
  })

  test('rejeita senha curta, nao muda senha nem consome token', async ({ client, db, assert }) => {
    const user = await UserFactory.create()
    const senhaOriginal = user.password
    const { token } = await new PasswordResetService().generateToken(user)

    const response = await client
      .post(`/reset-password/${token}`)
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({ password: 'curta', passwordConfirmation: 'curta' })

    response.assertStatus(422)

    await user.refresh()
    assert.equal(user.password, senhaOriginal)
    await db.assertHas('reset_password_tokens', { user_id: user.id })
  })

  test('GET com token valido renderiza pagina', async ({ client }) => {
    const user = await UserFactory.create()
    const { token } = await new PasswordResetService().generateToken(user)

    const response = await client.get(`/reset-password/${token}`).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/reset_password')
  })

  test('GET com token invalido redireciona para /forgot-password', async ({ client, assert }) => {
    const response = await client.get('/reset-password/token-invalido').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/forgot-password')
  })
})
