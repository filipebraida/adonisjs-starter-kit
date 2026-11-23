import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import i18nManager from '@adonisjs/i18n/services/main'
import { test } from '@japa/runner'

import RequestPasswordReset from '#auth/actions/request_password_reset'
import ResetPasswordToken from '#auth/models/reset_password_token'
import { UserFactory } from '#auth/database/factories/user'

test.group('RequestPasswordReset', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const i18n = () => i18nManager.locale(i18nManager.defaultLocale)

  test('emits auth:forgot_password with a new token for a known email', async ({ assert }) => {
    using fake = emitter.fake(['auth:forgot_password'])
    const user = await UserFactory.create()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })

    fake.assertEmitted('auth:forgot_password')

    const token = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()
    assert.isNotEmpty(token.token)
    assert.isTrue(token.expiresAt.diffNow('minutes').minutes > 30)
  })

  test('silent no-op when the email does not exist (does not leak the user)', async () => {
    using fake = emitter.fake(['auth:forgot_password'])
    await new RequestPasswordReset().handle({
      email: 'nao-existe@example.test',
      i18n: i18n(),
    })

    fake.assertNoneEmitted()
  })

  test('a second request while the link is valid sends the same link, so it cancels none', async ({
    db,
    assert,
  }) => {
    // The real listener's mail.prepare() calls urlFor and needs a live router.
    using _events = emitter.fake(['auth:forgot_password'])
    const user = await UserFactory.create()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })
    const first = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })

    await db.assertHas('reset_password_tokens', { user_id: user.id }, 1)
    const current = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()
    assert.equal(current.token, first.token)
  })
})
