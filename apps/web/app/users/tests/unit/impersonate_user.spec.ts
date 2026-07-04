import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import ImpersonateUser from '#users/actions/impersonate_user'
import type User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

type Handle = ImpersonateUser['handle']
type Input = Parameters<Handle>[0]

test.group('ImpersonateUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('guarda originalUserId na sessao e faz login como o impersonado', async ({ assert }) => {
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

    sinon.assert.calledOnceWithExactly(put, 'originalUserId', original.id)
    sinon.assert.calledOnce(login)
    assert.equal(login.firstCall.args[0].id, alvo.id)
  })
})
