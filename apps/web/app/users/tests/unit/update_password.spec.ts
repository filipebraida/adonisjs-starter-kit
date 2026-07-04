import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import UpdatePassword from '#users/actions/update_password'
import { UserFactory } from '#users/database/factories/user'

test.group('UpdatePassword', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('troca a senha e persiste hash novo', async ({ assert }) => {
    const user = await UserFactory.merge({ password: 'antiga-1234' }).create()
    const hashAntigo = user.password

    await new UpdatePassword().handle({ target: user, password: 'nova-senha-1234' })

    await user.refresh()
    assert.notEqual(user.password, hashAntigo)
    assert.isTrue(await hash.verify(user.password!, 'nova-senha-1234'))
    assert.isFalse(await hash.verify(user.password!, 'antiga-1234'))
  })
})
