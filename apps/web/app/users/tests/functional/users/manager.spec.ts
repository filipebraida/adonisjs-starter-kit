import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { withRole } from '#tests/helpers/rbac'

async function manager() {
  const user = await UserFactory.create()
  await withRole(user, ROLES.MANAGER)
  return user
}

test.group('Manager role', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('a regular user sees no admin screen', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    assertForbiddenRedirect(await client.get('/users').loginAs(user).redirects(0))
  })

  test('opens the user list but not the activity, roles or impersonation', async ({ client }) => {
    const user = await manager()
    const target = await UserFactory.create()
    await withRole(target, ROLES.USER)

    const list = await client.get('/users').loginAs(user).withInertia()
    list.assertStatus(200)

    assertForbiddenRedirect(await client.get('/users/activity').loginAs(user).redirects(0))
    assertForbiddenRedirect(await client.get('/roles').loginAs(user).redirects(0))
    assertForbiddenRedirect(
      await client
        .post(`/users/impersonate/${target.id}`)
        .loginAs(user)
        .withCsrfToken()
        .redirects(0)
    )
  })

  test('creates and edits a regular user', async ({ client, assert }) => {
    const user = await manager()
    const email = `managed-${Date.now()}@example.test`

    await client
      .post('/users')
      .json({ fullName: 'Managed One', email, role: ROLES.USER })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    const created = await User.findByOrFail('email', email)
    assert.deepEqual(await created.getRoles(), [ROLES.USER])

    await client
      .put(`/users/${created.id}`)
      .json({ fullName: 'Managed Two', email, role: ROLES.USER })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    await created.refresh()
    assert.equal(created.fullName, 'Managed Two')
  })

  test('cannot grant a role above user', async ({ client, assert }) => {
    const user = await manager()
    const email = `escalated-${Date.now()}@example.test`

    const response = await client
      .post('/users')
      .json({ fullName: 'Escalated', email, role: ROLES.ADMIN })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(403)
    assert.isNull(await User.findBy('email', email))
  })

  test('cannot edit or delete an admin', async ({ client, assert }) => {
    const user = await manager()
    const admin = await UserFactory.merge({ fullName: 'The Admin' }).create()
    await withRole(admin, ROLES.ADMIN)

    assertForbiddenRedirect(
      await client
        .put(`/users/${admin.id}`)
        .json({ fullName: 'Taken Over', email: admin.email, role: ROLES.ADMIN })
        .loginAs(user)
        .withCsrfToken()
        .redirects(0)
    )
    assertForbiddenRedirect(
      await client.delete(`/users/${admin.id}`).loginAs(user).withCsrfToken().redirects(0)
    )

    await admin.refresh()
    assert.equal(admin.fullName, 'The Admin')
  })
})
