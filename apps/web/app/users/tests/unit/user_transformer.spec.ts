import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#users/enums/role'
import UserTransformer from '#users/transformers/user_transformer'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('UserTransformer', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('toObject expõe id, fullName, email', async ({ assert }) => {
    const user = await UserFactory.merge({
      fullName: 'Fulano',
      email: 'fulano@example.test',
    }).create()

    const out = new UserTransformer(user).toObject()

    assert.deepEqual(out, {
      id: user.id,
      fullName: 'Fulano',
      email: 'fulano@example.test',
    })
  })

  test('forSharedProps adiciona avatarUrl aos campos base', async ({ assert }) => {
    const user = await UserFactory.create()

    const out = new UserTransformer(user).forSharedProps()

    assert.deepEqual(Object.keys(out).sort(), ['avatarUrl', 'email', 'fullName', 'id'])
  })

  test('forProfile tem mesmo shape de forSharedProps', async ({ assert }) => {
    const user = await UserFactory.create()

    const out = new UserTransformer(user).forProfile()

    assert.deepEqual(Object.keys(out).sort(), ['avatarUrl', 'email', 'fullName', 'id'])
  })

  test('forList inclui roles preloadados + createdAt ISO', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.ADMIN)
    await user.load('roles')

    const out = new UserTransformer(user).forList()

    assert.deepEqual(Object.keys(out).sort(), ['createdAt', 'email', 'fullName', 'id', 'roles'])
    assert.deepEqual(out.roles, [ROLES.ADMIN])
    assert.match(out.createdAt, /^\d{4}-\d{2}-\d{2}T/)
  })

  test('forEdit inclui roles preloadados (sem createdAt)', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    await user.load('roles')

    const out = new UserTransformer(user).forEdit()

    assert.deepEqual(Object.keys(out).sort(), ['email', 'fullName', 'id', 'roles'])
    assert.deepEqual(out.roles, [ROLES.USER])
  })
})
