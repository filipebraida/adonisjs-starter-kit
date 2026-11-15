import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import ImpersonateUser from '#users/actions/impersonate_user'
import type User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'

test.group('ImpersonateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('stores the impersonation mark in the session and signs in as the target', async ({
    assert,
  }) => {
    type Input = Parameters<ImpersonateUser['handle']>[0]
    const original = await UserFactory.create()
    const alvo = await UserFactory.create()

    const put = sinon.stub<[string, unknown], void>()
    const session = { put } as unknown as Input['session']

    const login = sinon.stub<[User], Promise<void>>().resolves()
    const auth = { use: () => ({ login }) } as unknown as Input['auth']

    await new ImpersonateUser().handle({
      impersonated: alvo,
      originalUserId: original.id,
      session,
      auth,
    })

    sinon.assert.calledOnceWithExactly(put, 'impersonation', {
      originalUserId: original.id,
      targetUserId: alvo.id,
    })
    sinon.assert.calledOnce(login)
    assert.equal(login.firstCall.args[0].id, alvo.id)
  })
})
