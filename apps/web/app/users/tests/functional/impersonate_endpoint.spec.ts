import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users/impersonate/:id', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('sem auth redireciona para login', async ({ client, assert }) => {
    const alvo = await UserFactory.create()

    const response = await client.post(`/users/impersonate/${alvo.id}`).withCsrfToken().redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('user comum eh barrado (nao altera sessao)', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const alvo = await UserFactory.create()

    const response = await client
      .post(`/users/impersonate/${alvo.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.equal(response.session().auth_web, user.id)
    assert.isUndefined(response.session().originalUserId)
  })

  test('admin nao pode impersonar a si mesmo (nao altera sessao)', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post(`/users/impersonate/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.equal(response.session().auth_web, admin.id)
    assert.isUndefined(response.session().originalUserId)
  })

  test('admin impersona outro: troca auth_web + guarda originalUserId', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    const response = await client
      .post(`/users/impersonate/${alvo.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    assert.equal(response.session().auth_web, alvo.id)
    assert.equal(response.session().originalUserId, admin.id)
  })
})
