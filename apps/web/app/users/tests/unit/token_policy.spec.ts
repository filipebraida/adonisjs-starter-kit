import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import TokenPolicy from '#users/policies/token_policy'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

async function policy() {
  return app.container.make(TokenPolicy)
}

test.group('TokenPolicy', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin pode criar/listar/deletar', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const p = await policy()

    assert.isTrue(await p.create(admin))
    assert.isTrue(await p.viewList(admin))
    assert.isTrue(await p.delete(admin))
  })

  test('user comum nao pode criar/listar/deletar', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const p = await policy()

    assert.isFalse(await p.create(user))
    assert.isFalse(await p.viewList(user))
    assert.isFalse(await p.delete(user))
  })
})
