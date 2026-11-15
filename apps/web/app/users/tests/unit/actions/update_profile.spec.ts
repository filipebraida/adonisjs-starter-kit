import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import UpdateProfile from '#users/actions/update_profile'
import { UserFactory } from '#auth/database/factories/user'

test.group('UpdateProfile', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('updates fullName without avatar', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Antigo' }).create()

    await new UpdateProfile().handle({ target: user, fullName: 'Novo' })

    await user.refresh()
    assert.equal(user.fullName, 'Novo')
  })

  test('null avatar does not replace the existing avatar', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Antigo' }).create()
    const avatarAntes = user.avatar

    await new UpdateProfile().handle({ target: user, fullName: 'Novo', avatar: null })

    await user.refresh()
    assert.equal(user.fullName, 'Novo')
    assert.equal(user.avatar, avatarAntes)
  })
})
