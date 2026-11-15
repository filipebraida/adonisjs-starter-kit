import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import AuthenticateWithSocial from '#auth/actions/authenticate_with_social'
import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'

test.group('AuthenticateWithSocial', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('reuses the existing user by email', async ({ db, assert }) => {
    const existente = await UserFactory.create()

    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: existente.email,
        name: 'Nome do Google',
        avatarUrl: 'https://cdn.google/avatar.png',
      },
      locale: 'en',
    })

    assert.equal(result.id, existente.id)
    await db.assertHas('users', { email: existente.email }, 1)
  })

  test('creates a new user when the email does not exist (password null)', async ({
    db,
    assert,
  }) => {
    const email = taggedEmail(marker('novo-social'))
    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email,
        name: 'Google User',
        avatarUrl: 'https://cdn.google/x.png',
      },
      locale: 'pt',
    })

    await db.assertHas('users', {
      id: result.id,
      email,
      full_name: 'Google User',
      avatar_url: 'https://cdn.google/x.png',
      locale: 'pt',
    })
    assert.isNull(result.password)
  })
})
