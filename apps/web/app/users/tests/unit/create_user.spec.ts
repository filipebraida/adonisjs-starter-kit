import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateUser from '#users/actions/create_user'
import ManageRolesUnauthorizedException from '#users/exceptions/manage_roles_unauthorized'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { currentRoleNames, ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('CreateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('admin cria user comum com role atribuido', async ({ db, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const created = await new CreateUser().handle({
      fullName: 'Joao Novo',
      email: 'joao-novo@example.test',
      role: ROLES.USER,
      password: 'senha-inicial-123',
      executor: admin,
    })

    await db.assertHas('users', { email: 'joao-novo@example.test', full_name: 'Joao Novo' })
    assert.deepEqual(await currentRoleNames(created), [ROLES.USER])
  })

  test('admin promove ao criar (usersManageRoles necessario para admin)', async ({ assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const created = await new CreateUser().handle({
      fullName: 'Ana Admin',
      email: 'ana-admin@example.test',
      role: ROLES.ADMIN,
      password: 'senha-inicial-123',
      executor: admin,
    })

    assert.deepEqual(await currentRoleNames(created), [ROLES.ADMIN])
  })

  test('usa UUID como senha quando nao informada (usuario nao consegue logar direto)', async ({
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const created = await new CreateUser().handle({
      fullName: 'Sem Senha',
      email: 'sem-senha@example.test',
      role: ROLES.USER,
      executor: admin,
    })

    assert.isNotNull(created.password)
    assert.notEqual(created.password, '')
  })

  test('user comum NAO pode criar admin', async ({ db, assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    await assert.rejects(
      () =>
        new CreateUser().handle({
          fullName: 'Escalador',
          email: 'escalador@example.test',
          role: ROLES.ADMIN,
          executor,
        }),
      ManageRolesUnauthorizedException
    )

    await db.assertMissing('users', { email: 'escalador@example.test' })
  })

  test('escalation guard so protege contra papel != USER (block user->user cabe a policy)', async ({
    db,
  }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    await new CreateUser().handle({
      fullName: 'Ok User',
      email: 'ok-user@example.test',
      role: ROLES.USER,
      executor,
    })

    await db.assertHas('users', { email: 'ok-user@example.test' })
  })
})
