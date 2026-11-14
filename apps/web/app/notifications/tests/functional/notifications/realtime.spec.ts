import type { HttpContext } from '@adonisjs/core/http'
import testUtils from '@adonisjs/core/services/test_utils'
import transmit from '@adonisjs/transmit/services/main'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'

test.group('Realtime notifications channel', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('the event stream requires a signed-in user', async ({ client, assert }) => {
    const response = await client.get('/__transmit/events').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('a user may subscribe to their own channel only', async ({ assert }) => {
    const user = await UserFactory.create()
    const other = await UserFactory.create()
    const ctx = { auth: { user } } as unknown as HttpContext
    const manager = transmit.getManager()

    assert.isTrue(await manager.verifyAccess(`notifications/users/${user.id}`, ctx))
    assert.isFalse(await manager.verifyAccess(`notifications/users/${other.id}`, ctx))
  })
})
