import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { ROLES } from '#auth/enums/role'
import Authorizer from '#core/authz/authorizer'
import ListReadableHelpArticles from '#help/queries/list_readable_help_articles'
import ResolveHelpAccess from '#help/queries/resolve_help_access'
import HelpCatalog from '#help/services/help_catalog'
import { withRole } from '#tests/helpers/rbac'

const FIXTURES = new URL('../../fixtures/app', import.meta.url).pathname

async function readableBy(role: string) {
  const user = await UserFactory.create()
  await withRole(user, role)
  const catalog = HelpCatalog.at(FIXTURES)
  const access = new ResolveHelpAccess(await app.container.make(Authorizer), catalog)
  return new ListReadableHelpArticles(catalog, access).handle(user)
}

test.group('List readable help articles', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('the space/article of every article the reader may read', async ({ assert }) => {
    assert.deepEqual(await readableBy(ROLES.ADMIN), ['guide/start', 'guide/locked', 'vault/secret'])
    assert.deepEqual(await readableBy(ROLES.USER), ['guide/start'])
  })
})
