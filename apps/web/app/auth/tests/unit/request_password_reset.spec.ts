import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import i18nManager from '@adonisjs/i18n/services/main'
import { test } from '@japa/runner'

import RequestPasswordReset from '#auth/actions/request_password_reset'
import ResetPasswordToken from '#users/models/reset_password_token'
import { UserFactory } from '#users/database/factories/user'

test.group('RequestPasswordReset', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  // Fake the event; the real listener's mail.prepare() calls signedUrlFor and needs a live router.
  let fake: ReturnType<typeof emitter.fake>
  group.each.setup(() => {
    fake = emitter.fake(['auth:forgot_password'])
    return () => emitter.restore()
  })

  const i18n = () => i18nManager.locale(i18nManager.defaultLocale)

  test('emite auth:forgot_password com token novo para email conhecido', async ({ assert }) => {
    const user = await UserFactory.create()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })

    fake.assertEmitted('auth:forgot_password')

    const token = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()
    assert.isNotEmpty(token.token)
    assert.isTrue(token.expiresAt.diffNow('minutes').minutes > 30)
  })

  test('no-op silencioso quando o email nao existe (nao vaza usuario)', async () => {
    await new RequestPasswordReset().handle({
      email: 'nao-existe@example.test',
      i18n: i18n(),
    })

    fake.assertNoneEmitted()
  })

  test('gerar dois tokens em sequencia mantem apenas o mais recente valido', async ({ assert }) => {
    const user = await UserFactory.create()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })
    const primeiro = await ResetPasswordToken.query().where('userId', user.id).firstOrFail()

    await new RequestPasswordReset().handle({ email: user.email, i18n: i18n() })
    const tokens = await ResetPasswordToken.query().where('userId', user.id)

    assert.lengthOf(tokens, 1)
    assert.notEqual(tokens[0].token, primeiro.token)
  })
})
