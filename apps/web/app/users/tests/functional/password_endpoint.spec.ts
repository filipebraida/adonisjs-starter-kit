import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint PUT /settings/password', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('sem auth redireciona para login e nao altera senha de ninguem', async ({
    client,
    assert,
  }) => {
    const alvo = await UserFactory.merge({ password: 'antiga-1234' }).create()
    const hashOriginal = alvo.password

    const response = await client
      .put('/settings/password')
      .withCsrfToken()
      .redirects(0)
      .json({ password: 'nova-1234', passwordConfirmation: 'nova-1234' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')

    await alvo.refresh()
    assert.equal(alvo.password, hashOriginal)
  })

  test('user autenticado troca a propria senha', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'antiga-1234' }).create()

    const response = await client
      .put('/settings/password')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .json({ password: 'nova-1234', passwordConfirmation: 'nova-1234' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/settings')

    await user.refresh()
    assert.isTrue(await hash.verify(user.password!, 'nova-1234'))
  })

  test('rejeita senha curta com 422 e mantem hash', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'antiga-1234' }).create()
    const hashOriginal = user.password

    const response = await client
      .put('/settings/password')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ password: 'curta', passwordConfirmation: 'curta' })

    response.assertStatus(422)
    await user.refresh()
    assert.equal(user.password, hashOriginal)
  })

  test('rejeita quando confirmacao nao bate e mantem hash', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'antiga-1234' }).create()
    const hashOriginal = user.password

    const response = await client
      .put('/settings/password')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ password: 'nova-1234', passwordConfirmation: 'outra-1234' })

    response.assertStatus(422)
    await user.refresh()
    assert.equal(user.password, hashOriginal)
  })
})
