import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import DeleteUser from '#users/actions/delete_user'
import User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

test.group('DeleteUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('remove o usuario do banco', async ({ assert }) => {
    const alvo = await UserFactory.create()

    await new DeleteUser().handle({ target: alvo })

    const remanescente = await User.find(alvo.id)
    assert.isNull(remanescente)
  })
})
