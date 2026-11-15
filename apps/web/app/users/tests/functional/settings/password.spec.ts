import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint PUT /settings/password', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('without auth redirects to login and changes no password', async ({ client, assert }) => {
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

  test('authenticated user changes their own password', async ({ client, assert }) => {
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

  test('rejects a short password with 422 and keeps the hash', async ({ client, assert }) => {
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

  test('rejects when the confirmation does not match and keeps the hash', async ({
    client,
    assert,
  }) => {
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
