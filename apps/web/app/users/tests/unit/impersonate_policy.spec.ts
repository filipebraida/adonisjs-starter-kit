import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ImpersonatePolicy from '#users/policies/impersonate_policy'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

async function policy() {
  return app.container.make(ImpersonatePolicy)
}

test.group('ImpersonatePolicy', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin pode impersonar outro usuario', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    const p = await policy()

    assert.isTrue(await p.create(admin, alvo))
  })

  test('admin NAO pode impersonar a si mesmo', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const p = await policy()

    assert.isFalse(await p.create(admin, admin))
  })

  test('user comum nao pode impersonar', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const alvo = await UserFactory.create()
    const p = await policy()

    assert.isFalse(await p.create(user, alvo))
  })
})
