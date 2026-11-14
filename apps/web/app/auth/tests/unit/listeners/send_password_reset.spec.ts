import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import { UserFactory } from '#auth/database/factories/user'
import SendPasswordReset from '#auth/listeners/send_password_reset'
import SendPasswordResetWorkflow from '#auth/workflows/send_password_reset_workflow'

const translations = {
  subject: 'Reset your password',
  title: 'Reset',
  subtitle: 'Use the link below.',
  actionBtn: 'Reset password',
  defaultMessage: 'Ignore it if you did not ask.',
}

test.group('SendPasswordReset listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('only schedules the mail, with plain data instead of the model', async ({ assert }) => {
    const dispatch = sinon
      .stub(SendPasswordResetWorkflow, 'dispatch')
      .resolves({ runId: 'run-1' } as never)
    const user = await UserFactory.create()

    await new SendPasswordReset().handle({ user, token: 'reset-token', translations })

    sinon.assert.calledOnce(dispatch)
    assert.deepEqual(dispatch.firstCall.args[0], {
      userId: user.id,
      token: 'reset-token',
      translations,
    })
  })
})
