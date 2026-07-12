import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'

import SignUp from '#auth/actions/sign_up'
import User from '#users/models/user'

test.group('SignUp', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('cria o usuario com senha hasheada', async ({ db, assert }) => {
    const user = await new SignUp().handle({
      fullName: 'Filipe Teste',
      email: 'novo@example.test',
      password: 'senha-inicial-123',
      locale: 'pt',
    })

    await db.assertHas('users', {
      email: 'novo@example.test',
      full_name: 'Filipe Teste',
      locale: 'pt',
    })

    const persisted = await User.findByOrFail('email', 'novo@example.test')
    assert.equal(persisted.id, user.id)
    assert.isNotNull(persisted.password)
    assert.notEqual(persisted.password, 'senha-inicial-123')
    assert.isTrue(await hash.verify(persisted.password!, 'senha-inicial-123'))
  })
})
