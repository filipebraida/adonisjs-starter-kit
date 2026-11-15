import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import authz from '@adonis-agora/authz/services/main'

import CreateRole from '#auth/actions/create_role'
import DeleteRole from '#auth/actions/delete_role'
import UpdateRoleCapabilities from '#auth/actions/update_role_capabilities'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { CAPABILITIES_AUTH } from '#auth/enums/capability'
import { ROLES } from '#auth/enums/role'
import RoleHasMembersException from '#auth/exceptions/role_has_members_exception'
import RoleNotFoundException from '#auth/exceptions/role_not_found_exception'
import StructuralRoleException from '#auth/exceptions/structural_role_exception'
import UnknownCapabilityException from '#auth/exceptions/unknown_capability_exception'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('Role actions', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('creates an institutional role and records it on the executor', async ({ assert }) => {
    const admin = await UserFactory.create()

    await new CreateRole().handle({ name: 'auditor', executor: admin })

    assert.include(await authz.store.listRoles(), 'auditor')
    const audit = await admin.audits().where('event', AUDIT_EVENTS.ROLE_CREATED).firstOrFail()
    assert.deepEqual(audit.metadata?.role, 'auditor')
  })

  test('refuses to create, edit or delete a role defined in code', async ({ assert }) => {
    const admin = await UserFactory.create()

    await assert.rejects(
      () => new CreateRole().handle({ name: ROLES.ADMIN, executor: admin }),
      StructuralRoleException
    )
    await assert.rejects(
      () =>
        new UpdateRoleCapabilities().handle({
          role: ROLES.USER,
          capabilities: [],
          executor: admin,
        }),
      StructuralRoleException
    )
    await assert.rejects(
      () => new DeleteRole().handle({ role: ROLES.ADMIN, executor: admin }),
      StructuralRoleException
    )
  })

  test('sets the capabilities to exactly the list and records before and after', async ({
    assert,
  }) => {
    const admin = await UserFactory.create()
    await new CreateRole().handle({ name: 'auditor', executor: admin })
    await authz.store.givePermissionToRole('auditor', CAPABILITIES_AUTH.usersManageRoles)

    await new UpdateRoleCapabilities().handle({
      role: 'auditor',
      capabilities: [],
      executor: admin,
    })

    assert.deepEqual(await authz.store.getRolePermissions('auditor'), [])
    const audit = await admin
      .audits()
      .where('event', AUDIT_EVENTS.ROLE_CAPABILITIES_CHANGED)
      .firstOrFail()
    assert.deepEqual(audit.oldValues, { capabilities: [CAPABILITIES_AUTH.usersManageRoles] })
    assert.deepEqual(audit.newValues, { capabilities: [] })
  })

  test('refuses a capability outside the vocabulary', async ({ assert }) => {
    const admin = await UserFactory.create()
    await new CreateRole().handle({ name: 'auditor', executor: admin })

    await assert.rejects(
      () =>
        new UpdateRoleCapabilities().handle({
          role: 'auditor',
          capabilities: ['nothing.real'],
          executor: admin,
        }),
      UnknownCapabilityException
    )
  })

  test('refuses to edit a role that was never created', async ({ assert }) => {
    const admin = await UserFactory.create()

    await assert.rejects(
      () =>
        new UpdateRoleCapabilities().handle({ role: 'ghost', capabilities: [], executor: admin }),
      RoleNotFoundException
    )
    assert.notInclude(await authz.store.listRoles(), 'ghost')
  })

  test('deletes a role nobody holds, but not one somebody does', async ({ assert }) => {
    const admin = await UserFactory.create()
    const member = await UserFactory.create()
    await new CreateRole().handle({ name: 'auditor', executor: admin })
    await new CreateRole().handle({ name: 'reviewer', executor: admin })
    await withRole(member, 'reviewer')

    await new DeleteRole().handle({ role: 'auditor', executor: admin })
    await assert.rejects(
      () => new DeleteRole().handle({ role: 'reviewer', executor: admin }),
      RoleHasMembersException
    )

    const roles = await authz.store.listRoles()
    assert.notInclude(roles, 'auditor')
    assert.include(roles, 'reviewer')
  })
})
