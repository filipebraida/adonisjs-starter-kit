import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateToken from '#users/actions/create_token'
import User from '#auth/models/user'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint /settings/tokens', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('POST without auth redirects to login', async ({ client, assert }) => {
    const response = await client.post('/settings/tokens').withCsrfToken().redirects(0).json({})
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('POST as regular user is blocked and creates no token', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client
      .post('/settings/tokens')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .json({ name: 'meu-token' })

    assertForbiddenRedirect(response)
    assert.lengthOf(await User.accessTokens.all(user), 0)
  })

  test('POST as admin creates a token and redirects to /settings', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/settings/tokens')
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({ name: 'meu-token' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/settings')

    const tokens = await User.accessTokens.all(admin)
    assert.lengthOf(tokens, 1)
    assert.equal(tokens[0].name, 'meu-token')
  })

  test('POST rejects a short name (422)', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/settings/tokens')
      .loginAs(admin)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ name: 'xx' })

    response.assertStatus(422)
  })

  test('DELETE removes own token as admin', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    await new CreateToken().handle({ owner: admin })
    const [token] = await User.accessTokens.all(admin)

    const response = await client
      .delete(`/settings/tokens/${token.identifier}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    const restantes = await User.accessTokens.all(admin)
    assert.lengthOf(restantes, 0)
  })

  test('DELETE as regular user is blocked and does not remove the real token', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    await new CreateToken().handle({ owner: user })
    const [token] = await User.accessTokens.all(user)

    const response = await client
      .delete(`/settings/tokens/${token.identifier}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    const restantes = await User.accessTokens.all(user)
    assert.lengthOf(restantes, 1)
    assert.equal(restantes[0].identifier, token.identifier)
  })
})
