import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import DeleteUser from '#users/actions/delete_user'
import { UserFactory } from '#auth/database/factories/user'

test.group('DeleteUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('removes the user from the database', async ({ db }) => {
    const alvo = await UserFactory.create()

    await new DeleteUser().handle({ target: alvo })

    await db.assertModelMissing(alvo)
  })
})
