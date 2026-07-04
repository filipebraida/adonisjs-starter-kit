import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import AdminLockoutException from '#users/exceptions/admin_lockout'
import ManageRolesUnauthorizedException from '#users/exceptions/manage_roles_unauthorized'
import SyncUserRoles from '#users/actions/sync_user_roles'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { currentRoleNames, ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('SyncUserRoles', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin promove um user comum para admin', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await new SyncUserRoles().handle({
      target: alvo,
      desiredRoles: [ROLES.ADMIN],
      executor: admin,
    })

    const roles = await currentRoleNames(alvo)
    assert.deepEqual(roles, [ROLES.ADMIN])
  })

  test('admin rebaixa outro admin para user', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const outroAdmin = await UserFactory.create()
    await withRole(outroAdmin, ROLES.ADMIN)

    await new SyncUserRoles().handle({
      target: outroAdmin,
      desiredRoles: [ROLES.USER],
      executor: admin,
    })

    const roles = await currentRoleNames(outroAdmin)
    assert.deepEqual(roles, [ROLES.USER])
  })

  test('user comum nao consegue trocar papeis (falta manage_roles)', async ({ assert }) => {
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

    const roles = await currentRoleNames(alvo)
    assert.deepEqual(roles, [ROLES.USER])
  })

  test('admin NAO consegue remover o proprio admin (lockout guard)', async ({ assert }) => {
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

    const roles = await currentRoleNames(admin)
    assert.deepEqual(roles, [ROLES.ADMIN])
  })

  test('admin pode manter seu proprio admin (sync idempotente)', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    await new SyncUserRoles().handle({
      target: admin,
      desiredRoles: [ROLES.ADMIN],
      executor: admin,
    })

    const roles = await currentRoleNames(admin)
    assert.deepEqual(roles, [ROLES.ADMIN])
  })
})
