import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateUser from '#users/actions/create_user'
import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('CreateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('admin cria user comum com role atribuido', async ({ db, assert }) => {
    const email = taggedEmail(marker('joao-novo'))
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const created = await new CreateUser().handle({
      fullName: 'Joao Novo',
      email,
      role: ROLES.USER,
      password: 'senha-inicial-123',
      executor: admin,
    })

    await db.assertHas('users', { id: created.id, email, full_name: 'Joao Novo' })
    assert.deepEqual(await created.getRoles(), [ROLES.USER])
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

    assert.deepEqual(await created.getRoles(), [ROLES.ADMIN])
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
    const email = taggedEmail(marker('escalador'))
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    await assert.rejects(
      () =>
        new CreateUser().handle({
          fullName: 'Escalador',
          email,
          role: ROLES.ADMIN,
          executor,
        }),
      ManageRolesUnauthorizedException
    )

    await db.assertMissing('users', { email })
  })

  test('escalation guard so protege contra papel != USER (block user->user cabe a policy)', async ({
    db,
  }) => {
    const email = taggedEmail(marker('ok-user'))
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    const created = await new CreateUser().handle({
      fullName: 'Ok User',
      email,
      role: ROLES.USER,
      executor,
    })

    await db.assertHas('users', { id: created.id, email })
  })
})
