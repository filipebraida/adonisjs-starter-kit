import drive from '@adonisjs/drive/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { attachmentManager } from '@jrmc/adonis-attachment'

import UpdateProfile from '#users/actions/update_profile'
import { UserFactory } from '#auth/database/factories/user'
import env from '#start/env'

test.group('UpdateProfile', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('updates fullName without avatar', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Old' }).create()

    await new UpdateProfile().handle({ target: user, fullName: 'New' })

    await user.refresh()
    assert.equal(user.fullName, 'New')
  })

  test('null avatar does not replace the existing avatar', async ({ assert }) => {
    using _disk = drive.fake(env.get('DRIVE_DISK') || 'fs')
    const user = await UserFactory.merge({ fullName: 'Old' }).create()
    user.avatar.set(
      await attachmentManager.createFromBuffer(Buffer.from('picture'), {
        originalName: 'avatar.png',
        mimeType: 'image/png',
      })
    )
    await user.save()
    const before = await user.avatar.get()

    await new UpdateProfile().handle({ target: user, fullName: 'New', avatar: null })

    await user.refresh()
    assert.equal(user.fullName, 'New')
    const after = await user.avatar.get()
    assert.equal(after?.attachmentId, before!.attachmentId)
  })
})
