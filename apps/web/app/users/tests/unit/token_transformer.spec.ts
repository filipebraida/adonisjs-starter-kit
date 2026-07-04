import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateToken from '#users/actions/create_token'
import TokenTransformer from '#users/transformers/token_transformer'
import User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

test.group('TokenTransformer', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('serializa id, name, timestamps (createdAt sempre ISO)', async ({ assert }) => {
    const owner = await UserFactory.create()
    await new CreateToken().handle({ owner, name: 'CI Bot' })
    const [token] = await User.accessTokens.all(owner)

    const out = new TokenTransformer(token).toObject()

    assert.equal(out.id, String(token.identifier))
    assert.equal(out.name, 'CI Bot')
    assert.match(out.createdAt, /^\d{4}-\d{2}-\d{2}T/)
    assert.isNull(out.lastUsedAt)
    assert.isNull(out.expiresAt)
  })
})
