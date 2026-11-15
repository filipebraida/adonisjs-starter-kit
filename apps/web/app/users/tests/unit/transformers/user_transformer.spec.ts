import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import UserTransformer from '#users/transformers/user_transformer'
import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('UserTransformer', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('toObject exposes id, fullName, email', async ({ assert }) => {
    const email = taggedEmail(marker('fulano'))
    const user = await UserFactory.merge({ fullName: 'Fulano', email }).create()

    const out = new UserTransformer(user).toObject()

    assert.deepEqual(out, {
      id: user.id,
      fullName: 'Fulano',
      email,
    })
  })

  test('forSharedProps adds avatarUrl to the base fields', async ({ assert }) => {
    const user = await UserFactory.create()

    const out = new UserTransformer(user).forSharedProps()

    assert.deepEqual(Object.keys(out).sort(), ['avatarUrl', 'email', 'fullName', 'id'])
  })

  test('forProfile has the same shape as forSharedProps', async ({ assert }) => {
    const user = await UserFactory.create()

    const out = new UserTransformer(user).forProfile()

    assert.deepEqual(Object.keys(out).sort(), ['avatarUrl', 'email', 'fullName', 'id'])
  })

  test('forList includes preloaded roles + ISO createdAt', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.ADMIN)
    await user.load('roles')

    const out = new UserTransformer(user).forList()

    assert.deepEqual(Object.keys(out).sort(), ['createdAt', 'email', 'fullName', 'id', 'roles'])
    assert.deepEqual(out.roles, [ROLES.ADMIN])
    assert.match(out.createdAt, /^\d{4}-\d{2}-\d{2}T/)
  })

  test('forEdit includes preloaded roles (no createdAt)', async ({ assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)
    await user.load('roles')

    const out = new UserTransformer(user).forEdit()

    assert.deepEqual(Object.keys(out).sort(), ['email', 'fullName', 'id', 'roles'])
    assert.deepEqual(out.roles, [ROLES.USER])
  })
})
