import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import { UserFactory } from '#auth/database/factories/user'
import SendWelcome from '#users/listeners/send_welcome'
import SendWelcomeWorkflow from '#users/workflows/send_welcome_workflow'

const translations = {
  subject: 'Welcome!',
  title: 'Welcome, Alice',
  subtitle: 'Set your password to sign in.',
  actionBtn: 'Set password',
  defaultMessage: 'Enjoy!',
}

test.group('SendWelcome listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('only schedules the welcome, with plain data instead of the model', async ({ assert }) => {
    const dispatch = sinon
      .stub(SendWelcomeWorkflow, 'dispatch')
      .resolves({ runId: 'run-1' } as never)
    const user = await UserFactory.create()

    await new SendWelcome().handle({ user, token: 'invite-token', translations, message: 'Hi' })

    sinon.assert.calledOnce(dispatch)
    assert.deepEqual(dispatch.firstCall.args[0], {
      userId: user.id,
      token: 'invite-token',
      translations,
      message: 'Hi',
    })
  })
})
