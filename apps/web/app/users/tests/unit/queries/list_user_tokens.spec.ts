import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateToken from '#users/actions/create_token'
import ListUserTokens from '#users/queries/list_user_tokens'
import { UserFactory } from '#auth/database/factories/user'

test.group('ListUserTokens', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('lists only the tokens of the owner', async ({ assert }) => {
    const owner = await UserFactory.create()
    const outro = await UserFactory.create()

    await new CreateToken().handle({ owner, name: 'meu-1' })
    await new CreateToken().handle({ owner, name: 'meu-2' })
    await new CreateToken().handle({ owner: outro, name: 'do-outro' })

    const tokens = await new ListUserTokens().handle({ owner })

    assert.lengthOf(tokens, 2)
    const nomes = tokens.map((t) => t.name)
    assert.includeMembers(nomes, ['meu-1', 'meu-2'])
    assert.notInclude(nomes, 'do-outro')
  })

  test('returns empty when the owner has no tokens', async ({ assert }) => {
    const owner = await UserFactory.create()

    const tokens = await new ListUserTokens().handle({ owner })

    assert.lengthOf(tokens, 0)
  })
})
