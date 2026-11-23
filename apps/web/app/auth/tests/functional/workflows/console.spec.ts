import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('The console of the durable workflows', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('a guest is sent to the login, and its API answers 401', async ({ client, assert }) => {
    const page = await client.get('/workflows').redirects(0)
    const api = await client.get('/workflows/api/runs')

    page.assertStatus(302)
    assert.equal(page.header('location'), '/login')
    api.assertStatus(401)
  })

  test('a user without the capability is turned away, the manager included', async ({ client }) => {
    for (const role of [ROLES.MANAGER, ROLES.USER]) {
      const user = await UserFactory.create()
      await withRole(user, role)

      const response = await client.get('/workflows').loginAs(user)

      response.assertStatus(403)
    }
  })

  test('an admin opens the console and its API', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const page = await client.get('/workflows').loginAs(admin)
    const api = await client.get('/workflows/api/runs').loginAs(admin)

    page.assertStatus(200)
    api.assertStatus(200)
  })
})
