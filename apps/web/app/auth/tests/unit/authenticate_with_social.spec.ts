import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import AuthenticateWithSocial from '#auth/actions/authenticate_with_social'
import { UserFactory } from '#users/database/factories/user'

test.group('AuthenticateWithSocial', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('reusa user existente pelo email', async ({ db, assert }) => {
    const existente = await UserFactory.merge({ email: 'ja-existe@example.test' }).create()

    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: 'ja-existe@example.test',
        name: 'Nome do Google',
        avatarUrl: 'https://cdn.google/avatar.png',
      },
      locale: 'en',
    })

    assert.equal(result.id, existente.id)
    await db.assertHas('users', { email: 'ja-existe@example.test' }, 1)
  })

  test('cria novo user quando email nao existe (password null)', async ({ db, assert }) => {
    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: 'novo-social@example.test',
        name: 'Google User',
        avatarUrl: 'https://cdn.google/x.png',
      },
      locale: 'pt',
    })

    await db.assertHas('users', {
      email: 'novo-social@example.test',
      full_name: 'Google User',
      avatar_url: 'https://cdn.google/x.png',
      locale: 'pt',
    })
    assert.isNull(result.password)
  })
})
