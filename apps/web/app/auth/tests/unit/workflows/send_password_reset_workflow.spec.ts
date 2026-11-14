import { assertRunStatus, createTestEngine } from '@adonis-agora/durable/testing'
import mail from '@adonisjs/mail/services/main'
import router from '@adonisjs/core/services/router'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
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

test.group('SendPasswordResetWorkflow', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('mails the reset link to the user', async () => {
    using mails = mail.fake()
    // The reset mail signs a named route; only the functional suite's HTTP server commits them.
    router.commit()
    const user = await UserFactory.create()

    const t = createTestEngine()
    const { name, version } = SendPasswordResetWorkflow.workflow
    t.engine.register(name, version, (ctx, input) =>
      new SendPasswordResetWorkflow().run(ctx, input as SendPasswordResetInput)
    )
    await t.run(name, { userId: user.id, token: 'reset-token', translations }, 'run-1')

    await assertRunStatus(t.store, 'run-1', 'completed')
    mails.mails.assertSent(ResetPasswordNotification, (sent) => sent.message.hasTo(user.email))
  })
})
