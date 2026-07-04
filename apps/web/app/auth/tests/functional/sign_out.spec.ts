import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint /logout', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('desloga e redireciona para marketing.show', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.post('/logout').redirects(0).loginAs(user).withCsrfToken()

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })
})
