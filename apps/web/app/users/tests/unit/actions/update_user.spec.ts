import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import UpdateUser from '#users/actions/update_user'
import { ROLES } from '#auth/enums/role'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('UpdateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin atualiza fullName, email e role do alvo', async ({ assert }) => {
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

  test('senha opcional: mantem hash quando nao informada', async ({ assert }) => {
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

  test('senha informada substitui e hasheia', async ({ assert }) => {
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

  test('user comum NAO pode promover para admin', async ({ assert }) => {
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
})
