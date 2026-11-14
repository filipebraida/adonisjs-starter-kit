import { assertRunStatus, createTestEngine } from '@adonis-agora/durable/testing'
import mail from '@adonisjs/mail/services/main'
import router from '@adonisjs/core/services/router'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import Notification from '#notifications/models/notification'
import WelcomeNotification from '#users/mails/welcome_notification'
import SendWelcomeWorkflow, { type SendWelcomeInput } from '#users/workflows/send_welcome_workflow'

const translations = {
  subject: 'Welcome!',
  title: 'Welcome, Alice',
  subtitle: 'Set your password to sign in.',
  actionBtn: 'Set password',
  defaultMessage: 'Enjoy!',
}

test.group('SendWelcomeWorkflow', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('mails the invite and records the in-app notification', async ({ assert }) => {
    using mails = mail.fake()
    // The welcome mail signs a named route; only the functional suite's HTTP server commits them.
    router.commit()
    const user = await UserFactory.create()

    const t = createTestEngine()
    const { name, version } = SendWelcomeWorkflow.workflow
    t.engine.register(name, version, (ctx, input) =>
      new SendWelcomeWorkflow().run(ctx, input as SendWelcomeInput)
    )
    await t.run(name, { userId: user.id, token: 'invite-token', translations }, 'run-1')

    await assertRunStatus(t.store, 'run-1', 'completed')
    mails.mails.assertSent(WelcomeNotification, (sent) => sent.message.hasTo(user.email))
    const notification = await Notification.query()
      .where('notifiableId', String(user.id))
      .where('type', 'user-welcome')
      .firstOrFail()
    assert.equal(notification.content.title, translations.title)
    assert.equal(notification.content.link, '/settings')
  })
})
