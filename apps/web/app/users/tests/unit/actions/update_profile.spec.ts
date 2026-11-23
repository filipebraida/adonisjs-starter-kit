import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

import UpdateProfile from '#users/actions/update_profile'
import { UserFactory } from '#auth/database/factories/user'

// The avatar as the column stores it after an upload, written straight in:
// the upload and the thumbnail are not what this spec checks.
const AVATAR = {
  name: 'avatars/avatar-before.png',
  originalName: 'avatar.png',
  size: 1024,
  extname: 'png',
  mimeType: 'image/png',
}

test.group('UpdateProfile', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('updates fullName without avatar', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Old' }).create()

    await new UpdateProfile().handle({ target: user, fullName: 'New' })

    await user.refresh()
    assert.equal(user.fullName, 'New')
  })

  test('null avatar does not replace the existing avatar', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Old' }).create()
    await db
      .from('users')
      .where('id', user.id)
      .update({ avatar: JSON.stringify(AVATAR) })
    await user.refresh()
    assert.equal(user.avatar?.name, AVATAR.name)

    await new UpdateProfile().handle({ target: user, fullName: 'New', avatar: null })

    await user.refresh()
    assert.equal(user.fullName, 'New')
    assert.equal(user.avatar?.name, AVATAR.name)
  })
})
