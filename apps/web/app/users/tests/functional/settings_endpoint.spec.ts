import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('Endpoint /settings', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('sem auth redireciona para login', async ({ client, assert }) => {
    const response = await client.get('/settings').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('user comum acessa e nao ve tokens (sem permission)', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/settings').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('users/settings')
    assert.deepEqual(response.inertiaProps.tokens, [])
  })

  test('admin acessa e ve o proprio profile', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/settings').loginAs(admin).withInertia()

    response.assertStatus(200)
    assert.equal(response.inertiaProps.profile.id, admin.id)
  })
})
