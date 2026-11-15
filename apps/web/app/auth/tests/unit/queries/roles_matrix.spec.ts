import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import authz from '@adonis-agora/authz/services/main'

import { ROLES } from '#auth/enums/role'
import RolesMatrix from '#auth/queries/roles_matrix'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('RolesMatrix', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('lists the roles in code first, then the institutional ones with their grants and members', async ({
    assert,
  }) => {
    await authz.store.createRole('reviewer')
    await authz.store.givePermissionToRole('reviewer', CAPABILITIES_AUTH.usersManageRoles)
    await withRole(await UserFactory.create(), 'reviewer')

    const { roles, vocabulary } = await new RolesMatrix().handle()

    assert.deepEqual(
      roles.map((role) => [role.name, role.structural]),
      [
        [ROLES.ADMIN, true],
        [ROLES.USER, true],
        ['reviewer', false],
      ]
    )
    const reviewer = roles.find((role) => role.name === 'reviewer')!
    assert.deepEqual(reviewer.capabilities, [CAPABILITIES_AUTH.usersManageRoles])
    assert.equal(reviewer.members, 1)
    assert.include(roles.find((role) => role.name === ROLES.ADMIN)!.capabilities, 'users.*')
    assert.include(vocabulary, CAPABILITIES_AUTH.usersManageRoles)
  })
})
