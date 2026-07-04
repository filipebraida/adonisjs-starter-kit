import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint GET /dashboard', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('sem auth redireciona para /login', async ({ client, assert }) => {
    const response = await client.get('/dashboard').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('autenticado renderiza analytics/dashboard', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/dashboard').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('analytics/dashboard')
  })
})
