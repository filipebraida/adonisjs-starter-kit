import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import User from '#users/models/user'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('GET /users sem auth redireciona para login', async ({ client, assert }) => {
    const response = await client.get('/users').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET /users como user comum eh barrado (redirect)', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).redirects(0)
    assertForbiddenRedirect(response)
  })

  test('GET /users como admin renderiza pagina', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/users').loginAs(admin).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/index')
  })

  test('POST /users cria user comum quando admin', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.post('/users').loginAs(admin).withCsrfToken().redirects(0).json({
      fullName: 'Novo Usuario',
      email: 'novo-por-admin@example.test',
      role: ROLES.USER,
    })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/users')

    const criado = await User.findByOrFail('email', 'novo-por-admin@example.test')
    assert.equal(criado.fullName, 'Novo Usuario')
  })

  test('POST /users com user comum eh barrado e nao cria', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.post('/users').loginAs(user).withCsrfToken().redirects(0).json({
      fullName: 'Novo',
      email: 'barrado@example.test',
      role: ROLES.USER,
    })

    assertForbiddenRedirect(response)
    assert.isNull(await User.findBy('email', 'barrado@example.test'))
  })

  test('POST /users com email duplicado retorna 422', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    await UserFactory.merge({ email: 'existe@example.test' }).create()

    const response = await client
      .post('/users')
      .loginAs(admin)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({
        fullName: 'Duplicado',
        email: 'existe@example.test',
        role: ROLES.USER,
      })

    response.assertStatus(422)
  })

  test('PUT /users/:id atualiza como admin', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.merge({ email: 'antes@example.test' }).create()
    await withRole(alvo, ROLES.USER)

    const response = await client
      .put(`/users/${alvo.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({
        fullName: 'Nome Alterado',
        email: 'antes@example.test',
        role: ROLES.USER,
      })

    response.assertStatus(302)
    await alvo.refresh()
    assert.equal(alvo.fullName, 'Nome Alterado')
  })

  test('DELETE /users/:id como admin remove o usuario', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    const response = await client
      .delete(`/users/${alvo.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    const restante = await User.find(alvo.id)
    assert.isNull(restante)
  })

  test('DELETE /users/:id do proprio admin eh barrado (self-delete guard)', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .delete(`/users/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.isNotNull(await User.find(admin.id))
  })
})
