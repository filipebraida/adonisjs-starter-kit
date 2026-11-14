import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('Exception handler', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('E_AUTHORIZATION_FAILURE em JSON retorna 403 com message', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).accept('json').redirects(0)

    response.assertStatus(403)
    assert.property(response.body(), 'message')
    assert.isString(response.body().message)
  })

  test('E_AUTHORIZATION_FAILURE em HTML redireciona (fluxo classico)', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })

  test('E_INVALID_CREDENTIALS em JSON retorna 401 com message', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'certa-123' }).create()

    const response = await client
      .post('/login')
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ email: user.email, password: 'errada' })

    response.assertStatus(401)
    assert.property(response.body(), 'message')
    assert.isString(response.body().message)
  })

  test('E_INVALID_CREDENTIALS em HTML redireciona pra /login', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'certa-123' }).create()

    const response = await client
      .post('/login')
      .withCsrfToken()
      .redirects(0)
      .json({ email: user.email, password: 'errada' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })
})
