import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import authz from '@adonis-agora/authz/services/main'

import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import RoleNotFoundException from '#auth/exceptions/role_not_found_exception'
import UpdateUser from '#users/actions/update_user'
import { ROLES } from '#auth/enums/role'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('UpdateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin updates fullName, email and role of the target', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await new UpdateUser().handle({
      target: alvo,
      fullName: 'Nome Novo',
      email: 'depois@example.test',
      role: ROLES.ADMIN,
      executor: admin,
    })

    await alvo.refresh()
    assert.equal(alvo.fullName, 'Nome Novo')
    assert.equal(alvo.email, 'depois@example.test')
    assert.deepEqual(await alvo.getRoles(), [ROLES.ADMIN])
  })

  test('optional password: keeps the hash when not provided', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.merge({ password: 'antiga-1234' }).create()
    await withRole(alvo, ROLES.USER)
    const hashAntigo = alvo.password

    await new UpdateUser().handle({
      target: alvo,
      fullName: alvo.fullName ?? 'x',
      email: alvo.email,
      role: ROLES.USER,
      executor: admin,
    })

    await alvo.refresh()
    assert.equal(alvo.password, hashAntigo)
  })

  test('provided password replaces and hashes', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const alvo = await UserFactory.merge({ password: 'antiga-1234' }).create()
    await withRole(alvo, ROLES.USER)

    await new UpdateUser().handle({
      target: alvo,
      fullName: alvo.fullName ?? 'x',
      email: alvo.email,
      role: ROLES.USER,
      password: 'nova-senha-1234',
      executor: admin,
    })

    await alvo.refresh()
    assert.isTrue(await hash.verify(alvo.password!, 'nova-senha-1234'))
  })

  test('regular user CANNOT promote to admin', async ({ assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)
    const alvo = await UserFactory.create()
    await withRole(alvo, ROLES.USER)

    await assert.rejects(
      () =>
        new UpdateUser().handle({
          target: alvo,
          fullName: 'X',
          email: alvo.email,
          role: ROLES.ADMIN,
          executor,
        }),
      ManageRolesUnauthorizedException
    )
  })

  test('a refused role change saves none of the other fields', async ({ assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)
    const alvo = await UserFactory.merge({ fullName: 'Before' }).create()
    await withRole(alvo, ROLES.USER)

    await assert.rejects(
      () =>
        new UpdateUser().handle({
          target: alvo,
          fullName: 'After',
          email: alvo.email,
          role: ROLES.ADMIN,
          executor,
        }),
      ManageRolesUnauthorizedException
    )

    const reloaded = await User.findOrFail(alvo.id)
    assert.equal(reloaded.fullName, 'Before')
  })

  test('keeping the same role needs no role capability', async ({ assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)
    const alvo = await UserFactory.merge({ fullName: 'Before' }).create()
    await withRole(alvo, ROLES.USER)

    await new UpdateUser().handle({
      target: alvo,
      fullName: 'After',
      email: alvo.email,
      role: ROLES.USER,
      executor,
    })

    const reloaded = await User.findOrFail(alvo.id)
    assert.equal(reloaded.fullName, 'After')
  })
  test('assigns an institutional role created on the roles page', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const target = await UserFactory.create()
    await withRole(target, ROLES.USER)
    await authz.store.createRole('reviewer')

    await new UpdateUser().handle({
      target,
      fullName: target.fullName ?? 'x',
      email: target.email,
      role: 'reviewer',
      executor: admin,
    })

    assert.deepEqual(await target.getRoles(), ['reviewer'])
  })

  test('a role that does not exist saves nothing and is not created', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const target = await UserFactory.merge({ fullName: 'Before' }).create()
    await withRole(target, ROLES.USER)

    await assert.rejects(
      () =>
        new UpdateUser().handle({
          target,
          fullName: 'After',
          email: target.email,
          role: 'ghost',
          executor: admin,
        }),
      RoleNotFoundException
    )

    const reloaded = await User.findOrFail(target.id)
    assert.equal(reloaded.fullName, 'Before')
    assert.notInclude(await authz.store.listRoles(), 'ghost')
  })
})
