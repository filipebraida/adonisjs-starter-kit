import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import authz from '@adonis-agora/authz/services/main'

import { ROLES } from '#auth/enums/role'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint /roles', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('a regular user is turned away', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/roles').loginAs(user).redirects(0)

    assertForbiddenRedirect(response)
  })

  test('an admin sees the roles page', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client.get('/roles').loginAs(admin).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/roles/index')
  })

  test('an admin creates a role and ticks its capabilities', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    await client
      .post('/roles')
      .form({ name: 'Auditor' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    await client
      .put('/roles/auditor')
      .json({ capabilities: [CAPABILITIES_AUTH.usersManageRoles] })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assert.deepEqual(await authz.store.getRolePermissions('auditor'), [
      CAPABILITIES_AUTH.usersManageRoles,
    ])
  })

  test('deleting a role somebody holds flashes the reason and keeps it', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    await authz.store.createRole('reviewer')
    await withRole(await UserFactory.create(), 'reviewer')

    const response = await client
      .delete('/roles/reviewer')
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage(
      'error',
      '1 user still has this role. Remove it from them before deleting it.'
    )
    assert.include(await authz.store.listRoles(), 'reviewer')
  })
})
