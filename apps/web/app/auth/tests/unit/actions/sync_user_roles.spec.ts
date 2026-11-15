import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import AdminLockoutException from '#auth/exceptions/admin_lockout_exception'
import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import SyncUserRoles from '#auth/actions/sync_user_roles'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('SyncUserRoles', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin promotes a regular user to admin', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await new SyncUserRoles().handle({
      target: alvo,
      desiredRoles: [ROLES.ADMIN],
      executor: admin,
    })

    const roles = await alvo.getRoles()
    assert.deepEqual(roles, [ROLES.ADMIN])
  })

  test('admin demotes another admin to user', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const outroAdmin = await UserFactory.create()
    await withRole(outroAdmin, ROLES.ADMIN)

    await new SyncUserRoles().handle({
      target: outroAdmin,
      desiredRoles: [ROLES.USER],
      executor: admin,
    })

    const roles = await outroAdmin.getRoles()
    assert.deepEqual(roles, [ROLES.USER])
  })

  test('regular user cannot change roles (missing manage_roles)', async ({ assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await assert.rejects(
      () =>
        new SyncUserRoles().handle({
          target: alvo,
          desiredRoles: [ROLES.ADMIN],
          executor,
        }),
      ManageRolesUnauthorizedException
    )

    const roles = await alvo.getRoles()
    assert.deepEqual(roles, [ROLES.USER])
  })

  test('admin CANNOT remove their own admin role (lockout guard)', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    await assert.rejects(
      () =>
        new SyncUserRoles().handle({
          target: admin,
          desiredRoles: [ROLES.USER],
          executor: admin,
        }),
      AdminLockoutException
    )

    const roles = await admin.getRoles()
    assert.deepEqual(roles, [ROLES.ADMIN])
  })

  test('admin can keep their own admin role (idempotent sync)', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    await new SyncUserRoles().handle({
      target: admin,
      desiredRoles: [ROLES.ADMIN],
      executor: admin,
    })

    const roles = await admin.getRoles()
    assert.deepEqual(roles, [ROLES.ADMIN])
  })

  test('records the role change with before and after', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await new SyncUserRoles().handle({ target: alvo, desiredRoles: [ROLES.ADMIN], executor: admin })

    const audit = await alvo.audits().where('event', AUDIT_EVENTS.ROLES_SYNCED).firstOrFail()
    assert.deepEqual(audit.oldValues, { roles: [ROLES.USER] })
    assert.deepEqual(audit.newValues, { roles: [ROLES.ADMIN] })
    assert.equal(audit.metadata?.executorId, admin.id)
  })

  test('records nothing when the roles do not change', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await new SyncUserRoles().handle({ target: alvo, desiredRoles: [ROLES.USER], executor: admin })

    const audits = await alvo.audits().where('event', AUDIT_EVENTS.ROLES_SYNCED)
    assert.lengthOf(audits, 0)
  })
})
