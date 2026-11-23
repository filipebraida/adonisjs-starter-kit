import { setWorkflowEngineResolver } from '@adonis-agora/durable'
import { createTestEngine } from '@adonis-agora/durable/testing'
import mail from '@adonisjs/mail/services/main'
import router from '@adonisjs/core/services/router'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import SendPasswordReset from '#auth/listeners/send_password_reset'
import ResetPasswordNotification from '#auth/mails/reset_password_notification'
import SendPasswordResetWorkflow, {
  type SendPasswordResetInput,
} from '#auth/workflows/send_password_reset_workflow'

const translations = {
  subject: 'Reset your password',
  title: 'Reset',
  subtitle: 'Use the link below.',
  actionBtn: 'Reset password',
  defaultMessage: 'Ignore it if you did not ask.',
}

test.group('SendPasswordReset listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('schedules the mail that reaches the user', async ({ assert, cleanup }) => {
    using mails = mail.fake()
    // The reset mail signs a named route; only the functional suite's HTTP server commits them.
    router.commit()
    const user = await UserFactory.create()
    const t = createTestEngine()
    const { name, version } = SendPasswordResetWorkflow.workflow
    t.engine.register(name, version, (ctx, input) =>
      new SendPasswordResetWorkflow().run(ctx, input as SendPasswordResetInput)
    )
    setWorkflowEngineResolver(() => t.engine)
    cleanup(() => setWorkflowEngineResolver(undefined))

    await new SendPasswordReset().handle({ user, token: 'reset-token', translations })

    const [run] = await t.store.listRuns({})
    assert.exists(run)
    await t.engine.waitForRun(run.id)
    mails.mails.assertSent(ResetPasswordNotification, (sent) => sent.message.hasTo(user.email))
  })
})
