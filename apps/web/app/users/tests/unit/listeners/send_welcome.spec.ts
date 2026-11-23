import { setWorkflowEngineResolver } from '@adonis-agora/durable'
import { createTestEngine } from '@adonis-agora/durable/testing'
import mail from '@adonisjs/mail/services/main'
import router from '@adonisjs/core/services/router'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import SendWelcome from '#users/listeners/send_welcome'
import WelcomeNotification from '#users/mails/welcome_notification'
import SendWelcomeWorkflow, { type SendWelcomeInput } from '#users/workflows/send_welcome_workflow'

const translations = {
  subject: 'Welcome!',
  title: 'Welcome, Alice',
  subtitle: 'Set your password to sign in.',
  actionBtn: 'Set password',
  defaultMessage: 'Enjoy!',
}

test.group('SendWelcome listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('schedules the welcome that reaches the user', async ({ assert, cleanup }) => {
    using mails = mail.fake()
    // The welcome mail signs a named route; only the functional suite's HTTP server commits them.
    router.commit()
    const user = await UserFactory.create()
    const t = createTestEngine()
    const { name, version } = SendWelcomeWorkflow.workflow
    t.engine.register(name, version, (ctx, input) =>
      new SendWelcomeWorkflow().run(ctx, input as SendWelcomeInput)
    )
    setWorkflowEngineResolver(() => t.engine)
    cleanup(() => setWorkflowEngineResolver(undefined))

    await new SendWelcome().handle({ user, token: 'invite-token', translations, message: 'Hi' })

    const [run] = await t.store.listRuns({})
    assert.exists(run)
    await t.engine.waitForRun(run.id)
    mails.mails.assertSent(WelcomeNotification, (sent) => sent.message.hasTo(user.email))
  })
})
