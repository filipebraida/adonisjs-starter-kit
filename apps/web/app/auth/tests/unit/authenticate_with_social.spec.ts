import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import AuthenticateWithSocial from '#auth/actions/authenticate_with_social'
import type User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

type Handle = AuthenticateWithSocial['handle']
type Auth = Parameters<Handle>[0]['auth']

test.group('AuthenticateWithSocial', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('reusa user existente pelo email e faz login', async ({ db, assert }) => {
    const existente = await UserFactory.merge({ email: 'ja-existe@example.test' }).create()
    const login = sinon.stub<[User], Promise<void>>().resolves()
    const auth = { use: () => ({ login }) } as unknown as Auth

    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: 'ja-existe@example.test',
        name: 'Nome do Google',
        avatarUrl: 'https://cdn.google/avatar.png',
      },
      auth,
    })

    assert.equal(result.id, existente.id)
    await db.assertHas('users', { email: 'ja-existe@example.test' }, 1)
    sinon.assert.calledOnce(login)
    assert.equal(login.firstCall.args[0].id, existente.id)
  })

  test('cria novo user quando email nao existe (password null)', async ({ db, assert }) => {
    const login = sinon.stub<[User], Promise<void>>().resolves()
    const auth = { use: () => ({ login }) } as unknown as Auth

    const result = await new AuthenticateWithSocial().handle({
      socialUser: {
        email: 'novo-social@example.test',
        name: 'Google User',
        avatarUrl: 'https://cdn.google/x.png',
      },
      auth,
    })

    await db.assertHas('users', {
      email: 'novo-social@example.test',
      full_name: 'Google User',
      avatar_url: 'https://cdn.google/x.png',
    })
    assert.isNull(result.password)
    sinon.assert.calledOnceWithExactly(login, result)
  })
})
