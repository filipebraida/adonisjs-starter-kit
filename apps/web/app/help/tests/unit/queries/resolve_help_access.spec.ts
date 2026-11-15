import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import Authorizer from '#core/authz/authorizer'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'
import { withRole } from '#tests/helpers/rbac'

const FIXTURES = new URL('../../fixtures/app', import.meta.url).pathname

async function accessOf(role: string) {
  const user = await UserFactory.create()
  await withRole(user, role)
  const access = new ResolveHelpAccess(
    await app.container.make(Authorizer),
    HelpCatalog.at(FIXTURES)
  )
  return [...(await access.handle(user))]
}

test.group('Resolve help access', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('the capabilities the indexes cite that the reader holds', async ({ assert }) => {
    assert.deepEqual(await accessOf(ROLES.ADMIN), ['users.view_list'])
    assert.deepEqual(await accessOf(ROLES.USER), [])
  })
})
