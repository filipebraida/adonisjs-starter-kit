import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import UserPolicy from '#users/policies/user_policy'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

async function policy() {
  return app.container.make(UserPolicy)
}

test.group('UserPolicy', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin can list, view, create, update, delete and invite', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    const p = await policy()

    assert.isTrue(await p.viewList(admin))
    assert.isTrue(await p.view(admin, alvo))
    assert.isTrue(await p.create(admin))
    assert.isTrue(await p.update(admin, alvo))
    assert.isTrue(await p.delete(admin, alvo))
    assert.isTrue(await p.invite(admin))
  })

  test('regular user cannot list/create/delete/invite others', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const alvo = await UserFactory.create()
    const p = await policy()

    assert.isFalse(await p.viewList(user))
    assert.isFalse(await p.create(user))
    assert.isFalse(await p.update(user, alvo))
    assert.isFalse(await p.delete(user, alvo))
    assert.isFalse(await p.invite(user))
  })

  test('any user can view and update themselves', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const p = await policy()

    assert.isTrue(await p.view(user, user))
    assert.isTrue(await p.update(user, user))
  })

  test('no one can delete themselves — not even admin', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const p = await policy()

    assert.isFalse(await p.delete(admin, admin))
  })

  test('user without a role has no permission', async ({ assert }) => {
    const semRole = await UserFactory.create()
    const alvo = await UserFactory.create()
    const p = await policy()

    assert.isFalse(await p.viewList(semRole))
    assert.isFalse(await p.create(semRole))
    assert.isFalse(await p.update(semRole, alvo))
    assert.isFalse(await p.delete(semRole, alvo))
    assert.isFalse(await p.invite(semRole))
  })
})
