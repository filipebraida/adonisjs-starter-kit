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
    assert.isUndefined(response.session().impersonation)
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
    assert.isUndefined(response.session().impersonation)
  })

  test('admin impersona outro: troca auth_web + guarda a marca de impersonacao', async ({
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
})
