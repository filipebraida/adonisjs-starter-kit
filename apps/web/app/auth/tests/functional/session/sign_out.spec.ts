import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint /logout', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('logs out, clears the session and redirects to marketing.show', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()

    const response = await client.post('/logout').redirects(0).loginAs(user).withCsrfToken()

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
    assert.isUndefined(response.session().auth_web)
  })

  test('drops the impersonation mark, so it cannot outlive the session', async ({
    client,
    assert,
  }) => {
    const admin = await UserFactory.create()
    const target = await UserFactory.create()

    const response = await client
      .post('/logout')
      .redirects(0)
      .loginAs(target)
      .withSession({ impersonation: { originalUserId: admin.id, targetUserId: target.id } })
      .withCsrfToken()

    response.assertStatus(302)
    assert.isUndefined(response.session().impersonation)
  })
})
