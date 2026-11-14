import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint GET /users/activity', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('without auth redirects to login', async ({ client, assert }) => {
    const response = await client.get('/users/activity').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('a regular user is turned away', async ({ client }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users/activity').loginAs(user).redirects(0)

    assertForbiddenRedirect(response)
  })

  test('an admin sees what a user did, with who acted and from where', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()

    await client.post(`/users/impersonate/${alvo.id}`).loginAs(admin).withCsrfToken().redirects(0)

    const response = await client
      .get('/users/activity')
      .qs({ actorId: admin.id, event: AUDIT_EVENTS.IMPERSONATION_STARTED })
      .loginAs(admin)
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('users/activity')
    const rows = response.inertiaProps.audits.data
    assert.lengthOf(rows, 1)
    assert.equal(rows[0].event, AUDIT_EVENTS.IMPERSONATION_STARTED)
    assert.equal(rows[0].actor.id, admin.id)
    assert.equal(rows[0].auditableId, alvo.id)
    assert.isNotNull(rows[0].ipAddress)
  })

  test('rejects an unknown event filter', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .get('/users/activity')
      .qs({ event: 'not_an_event' })
      .loginAs(admin)
      .accept('json')

    response.assertStatus(422)
  })
})
