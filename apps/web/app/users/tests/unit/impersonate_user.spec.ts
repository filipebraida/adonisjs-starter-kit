import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ImpersonateUser from '#users/actions/impersonate_user'
import type User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

function createSessionStub() {
  const store = new Map<string, unknown>()
  const session = {
    put: (key: string, value: unknown) => store.set(key, value),
    get: (key: string) => store.get(key),
  }
  return {
    session: session as unknown as Parameters<ImpersonateUser['handle']>[0]['session'],
    store,
  }
}

function createAuthSpy() {
  const calls: User[] = []
  const auth = {
    use: (_guard: string) => ({
      login: async (user: User) => {
        calls.push(user)
      },
    }),
  }
  return { auth: auth as unknown as Parameters<ImpersonateUser['handle']>[0]['auth'], calls }
}

test.group('ImpersonateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('guarda originalUserId na sessao e faz login como o impersonado', async ({ assert }) => {
    const original = await UserFactory.create()
    const alvo = await UserFactory.create()
    const { session, store } = createSessionStub()
    const { auth, calls } = createAuthSpy()

    await new ImpersonateUser().handle({
      impersonated: alvo,
      originalUserId: original.id,
      session,
      auth,
    })

    assert.equal(store.get('originalUserId'), original.id)
    assert.lengthOf(calls, 1)
    assert.equal(calls[0].id, alvo.id)
  })
})
