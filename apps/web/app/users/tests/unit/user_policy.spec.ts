import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import UserPolicy from '#users/policies/user_policy'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

async function policy() {
  return app.container.make(UserPolicy)
}

test.group('UserPolicy', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin pode listar, ver, criar, atualizar, deletar e convidar', async ({ assert }) => {
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

  test('user comum nao lista/cria/deleta/convida outros', async ({ assert }) => {
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

  test('qualquer usuario pode ver e atualizar a si mesmo', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    const p = await policy()

    assert.isTrue(await p.view(user, user))
    assert.isTrue(await p.update(user, user))
  })

  test('ninguem pode deletar a si mesmo — nem admin', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const p = await policy()

    assert.isFalse(await p.delete(admin, admin))
  })

  test('user sem papel nao tem nenhuma permissao', async ({ assert }) => {
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
