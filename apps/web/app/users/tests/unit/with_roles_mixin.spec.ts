import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import Role from '#users/models/role'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('WithRoles mixin', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('assignRole atualiza getRoleNames imediatamente (sem cache stale)', async ({ assert }) => {
    const user = await UserFactory.create()
    const admin = await Role.findByOrFail('name', ROLES.ADMIN)

    await user.assignRole(admin)

    assert.deepEqual(await user.getRoleNames(), [ROLES.ADMIN])
  })

  test('syncRoles atualiza getRoleNames imediatamente', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.ADMIN)

    const userRole = await Role.findByOrFail('name', ROLES.USER)
    await user.syncRoles([userRole])

    assert.deepEqual(await user.getRoleNames(), [ROLES.USER])
  })

  test('revokeRole remove o papel e atualiza cache', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.ADMIN)
    const admin = await Role.findByOrFail('name', ROLES.ADMIN)

    await user.revokeRole(admin)

    assert.deepEqual(await user.getRoleNames(), [])
    assert.isFalse(await user.hasRole(ROLES.ADMIN))
  })

  test('revokeRoles remove multiplos e atualiza cache', async ({ assert }) => {
    const user = await UserFactory.create()
    const admin = await Role.findByOrFail('name', ROLES.ADMIN)
    const userRole = await Role.findByOrFail('name', ROLES.USER)
    await user.assignRoles([admin, userRole])
    assert.lengthOf(await user.getRoleNames(), 2)

    await user.revokeRoles([admin, userRole])

    assert.deepEqual(await user.getRoleNames(), [])
  })

  test('hasPermission reflete estado atual apos syncRoles', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.ADMIN)
    assert.isTrue(await user.hasPermission('users.view_list'))

    const userRole = await Role.findByOrFail('name', ROLES.USER)
    await user.syncRoles([userRole])

    assert.isFalse(await user.hasPermission('users.view_list'))
  })
})
