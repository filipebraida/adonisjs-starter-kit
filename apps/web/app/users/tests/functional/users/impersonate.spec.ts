import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { ROLES } from '#auth/enums/role'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users/impersonate/:id', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('without auth redirects to login', async ({ client, assert }) => {
    const alvo = await UserFactory.create()

    const response = await client.post(`/users/impersonate/${alvo.id}`).withCsrfToken().redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('regular user is blocked (session unchanged)', async ({ client, assert }) => {
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
    assert.isUndefined(response.session().impersonation)
  })

  test('admin cannot impersonate themselves (session unchanged)', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post(`/users/impersonate/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.equal(response.session().auth_web, admin.id)
    assert.isUndefined(response.session().impersonation)
  })

  test('admin impersonates another user: swaps auth_web and stores the impersonation mark', async ({
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
    assert.deepEqual(response.session().impersonation, {
      originalUserId: admin.id,
      targetUserId: alvo.id,
    })
  })

  test('records who started the impersonation, as the admin', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()

    await client.post(`/users/impersonate/${alvo.id}`).loginAs(admin).withCsrfToken().redirects(0)

    const audit = await alvo
      .audits()
      .where('event', AUDIT_EVENTS.IMPERSONATION_STARTED)
      .firstOrFail()
    assert.equal(audit.userId, String(admin.id))
  })

  test('under impersonation, audits name the target and the admin behind it', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    const alvo = await UserFactory.create()

    await client
      .put('/settings/password')
      .loginAs(alvo)
      .withSession({ impersonation: { originalUserId: admin.id, targetUserId: alvo.id } })
      .withCsrfToken()
      .redirects(0)
      .json({ password: 'nova-12345', passwordConfirmation: 'nova-12345' })

    const refreshed = await User.findOrFail(alvo.id)
    const audit = await refreshed.audits().where('event', AUDIT_EVENTS.UPDATED).firstOrFail()
    assert.equal(audit.userId, String(alvo.id))
    assert.equal(audit.metadata?.impersonated_by, String(admin.id))
  })

  test('a stale impersonation mark is not attributed to the old admin', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    const outro = await UserFactory.create()
    const alvo = await UserFactory.create()

    await client
      .put('/settings/password')
      .loginAs(alvo)
      .withSession({ impersonation: { originalUserId: admin.id, targetUserId: outro.id } })
      .withCsrfToken()
      .redirects(0)
      .json({ password: 'nova-12345', passwordConfirmation: 'nova-12345' })

    const audit = await alvo.audits().where('event', AUDIT_EVENTS.UPDATED).firstOrFail()
    assert.notProperty(audit.metadata ?? {}, 'impersonated_by')
  })
  test('switching back signs the admin in again and records it', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const target = await UserFactory.create()

    const response = await client
      .delete('/users/impersonate')
      .withSession({ impersonation: { originalUserId: admin.id, targetUserId: target.id } })
      .loginAs(target)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/users')
    assert.equal(response.session().auth_web, admin.id)
    assert.isUndefined(response.session().impersonation)
    const audit = await target
      .audits()
      .where('event', AUDIT_EVENTS.IMPERSONATION_STOPPED)
      .firstOrFail()
    assert.equal(audit.metadata?.originalUserId, admin.id)
  })

  test('under an impersonation nobody else is impersonated: the mark of who started it stays', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const otherAdmin = await UserFactory.create()
    await withRole(otherAdmin, ROLES.ADMIN)
    const third = await UserFactory.create()
    const mark = { originalUserId: admin.id, targetUserId: otherAdmin.id }

    const response = await client
      .post(`/users/impersonate/${third.id}`)
      .withSession({ impersonation: mark })
      .loginAs(otherAdmin)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.equal(response.session().auth_web, otherAdmin.id)
    assert.deepEqual(response.session().impersonation, mark)
  })

  test('switching back without an impersonation is refused', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .delete('/users/impersonate')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    assertForbiddenRedirect(response)
    assert.equal(response.session().auth_web, user.id)
  })
})
