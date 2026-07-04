import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import CreateToken from '#users/actions/create_token'
import DeleteToken from '#users/actions/delete_token'
import User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

test.group('DeleteToken', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('remove token do owner', async ({ assert }) => {
    const owner = await UserFactory.create()
    await new CreateToken().handle({ owner, name: 'para-deletar' })
    await new CreateToken().handle({ owner, name: 'sobrevivente' })

    const [alvo, mantido] = await User.accessTokens.all(owner)

    await new DeleteToken().handle({ owner, tokenId: String(alvo.identifier) })

    const remanescentes = await User.accessTokens.all(owner)
    assert.lengthOf(remanescentes, 1)
    assert.equal(remanescentes[0].identifier, mantido.identifier)
  })

  test('nao remove token de outro usuario mesmo com id valido', async ({ assert }) => {
    const owner = await UserFactory.create()
    const outro = await UserFactory.create()
    await new CreateToken().handle({ owner })
    await new CreateToken().handle({ owner: outro })

    const [tokenDoOwner] = await User.accessTokens.all(owner)

    await new DeleteToken().handle({ owner: outro, tokenId: String(tokenDoOwner.identifier) })

    const doOwnerAinda = await User.accessTokens.all(owner)
    assert.lengthOf(doOwnerAinda, 1)
  })
})
