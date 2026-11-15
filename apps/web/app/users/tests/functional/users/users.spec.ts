import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { marker, taggedEmail } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('GET /users without auth redirects to login', async ({ client, assert }) => {
    const response = await client.get('/users').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET /users as regular user is blocked (redirect)', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).redirects(0)
    assertForbiddenRedirect(response)
  })

  test('GET /users as admin renders the page', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/users').loginAs(admin).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/index')
  })

  test('GET /users/create without auth redirects to login', async ({ client, assert }) => {
    const response = await client.get('/users/create').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET /users/create as regular user is blocked', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users/create').loginAs(user).redirects(0)
    assertForbiddenRedirect(response)
  })

  test('GET /users/create as admin renders the users/create modal over users/index', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/users/create').loginAs(admin).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/index')
    assert.equal(response.inertiaProps.modal.component, 'users/create')
    assert.equal(response.inertiaProps.modal.baseUrl, '/users')
  })

  test('GET /users/:id/edit without auth redirects to login', async ({ client, assert }) => {
    const alvo = await UserFactory.create()

    const response = await client.get(`/users/${alvo.id}/edit`).redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET /users/:id/edit as regular user is blocked', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const alvo = await UserFactory.create()

    const response = await client.get(`/users/${alvo.id}/edit`).loginAs(user).redirects(0)
    assertForbiddenRedirect(response)
  })

  test('GET /users/:id/edit as admin renders the users/edit modal with the target user', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.merge({ fullName: 'Alvo Edicao' }).create()
    await withRole(alvo, ROLES.USER)

    const response = await client.get(`/users/${alvo.id}/edit`).loginAs(admin).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/index')
    assert.equal(response.inertiaProps.modal.component, 'users/edit')
    assert.equal(response.inertiaProps.modal.props.user.id, alvo.id)
    assert.equal(response.inertiaProps.modal.props.user.fullName, 'Alvo Edicao')
  })

  test('GET /users/:id/edit with a nonexistent id returns 404', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/users/99999999/edit').loginAs(admin).redirects(0)
    response.assertStatus(404)
  })

  test('POST /users creates a regular user when admin', async ({ client, db, assert }) => {
    const email = taggedEmail(marker('novo-por-admin'))
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.post('/users').loginAs(admin).withCsrfToken().redirects(0).json({
      fullName: 'Novo Usuario',
      email,
      role: ROLES.USER,
    })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/users')

    await db.assertHas('users', {
      email,
      full_name: 'Novo Usuario',
    })
  })

  test('POST /users as regular user is blocked and creates nothing', async ({ client, db }) => {
    const email = taggedEmail(marker('barrado'))
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.post('/users').loginAs(user).withCsrfToken().redirects(0).json({
      fullName: 'Novo',
      email,
      role: ROLES.USER,
    })

    assertForbiddenRedirect(response)
    await db.assertMissing('users', { email })
  })

  test('POST /users with duplicate email returns 422', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const existente = await UserFactory.create()

    const response = await client
      .post('/users')
      .loginAs(admin)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({
        fullName: 'Duplicado',
        email: existente.email,
        role: ROLES.USER,
      })

    response.assertStatus(422)
  })

  test('PUT /users/:id updates as admin', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    const response = await client
      .put(`/users/${alvo.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({
        fullName: 'Nome Alterado',
        email: alvo.email,
        role: ROLES.USER,
      })

    response.assertStatus(302)
    await alvo.refresh()
    assert.equal(alvo.fullName, 'Nome Alterado')
  })

  test('DELETE /users/:id as admin removes the user', async ({ client, db }) => {
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
    await db.assertModelMissing(alvo)
  })

  test('DELETE /users/:id on the admin themselves is blocked (self-delete guard)', async ({
    client,
    db,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .delete(`/users/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    await db.assertModelExists(admin)
  })
})
