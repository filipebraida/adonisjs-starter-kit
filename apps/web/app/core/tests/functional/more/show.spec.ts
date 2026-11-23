import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint GET /more', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('without auth redirects to login', async ({ client, assert }) => {
    const response = await client.get('/more').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('opens in the asked shell, and in the app when none is asked', async ({ client }) => {
    const user = await UserFactory.create()

    const fromAdmin = await client.get('/more?area=admin').loginAs(user).withInertia()
    const withoutArea = await client.get('/more').loginAs(user).withInertia()

    fromAdmin.assertInertiaComponent('core/more')
    fromAdmin.assertInertiaPropsContains({ area: 'admin' })
    withoutArea.assertInertiaPropsContains({ area: 'app' })
  })
})
