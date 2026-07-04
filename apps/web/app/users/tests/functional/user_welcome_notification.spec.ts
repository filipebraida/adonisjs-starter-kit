import emitter from '@adonisjs/core/services/emitter'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import Notification from '#notifications/models/notification'
import { UserFactory } from '#users/database/factories/user'

const translations = {
  subject: 'Welcome!',
  title: 'Welcome, Alice',
  subtitle: 'Set your password to sign in.',
  actionBtn: 'Set password',
  defaultMessage: 'Enjoy!',
}

test.group('User welcome notification', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    mail.fake()
    return () => mail.restore()
  })

  test('user:registered fires the listener and persists the welcome notification', async ({
    assert,
  }) => {
    const user = await UserFactory.create()

    await emitter.emit('user:registered', {
      user,
      token: 'test-reset-token',
      translations,
      message: undefined,
    })

    const notification = await Notification.query()
      .where('notifiableId', String(user.id))
      .where('type', 'user-welcome')
      .first()

    assert.exists(notification)
    assert.equal(notification!.content.title, translations.title)
    assert.equal(notification!.content.body, translations.subtitle)
    assert.equal(notification!.content.link, '/settings')
    assert.isNull(notification!.seenAt)
    assert.isNull(notification!.readAt)
  })
})
