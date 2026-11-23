import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateToken from '#users/actions/create_token'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'

test.group('CreateToken', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('generates a token bound to the owner with a custom name', async ({ assert }) => {
    const owner = await UserFactory.create()

    const created = await new CreateToken().handle({ owner, name: 'CI Bot' })

    assert.isNotEmpty(created.type)
    assert.isNotEmpty(created.token)

    const tokens = await User.accessTokens.all(owner)
    assert.lengthOf(tokens, 1)
    assert.equal(tokens[0].name, 'CI Bot')
  })

  test('uses "Secret Token" as the default name', async ({ assert }) => {
    const owner = await UserFactory.create()

    await new CreateToken().handle({ owner })

    const tokens = await User.accessTokens.all(owner)
    assert.equal(tokens[0].name, 'Secret Token')
  })

  test('records the token creation on the owner, without the secret', async ({ assert }) => {
    const owner = await UserFactory.create()

    const created = await new CreateToken().handle({ owner, name: 'CI Bot' })

    const audit = await owner.audits().where('event', AUDIT_EVENTS.TOKEN_CREATED).firstOrFail()
    assert.equal(audit.newValues?.name, 'CI Bot')
    assert.notInclude(JSON.stringify(audit.newValues), created.token)
  })
})
