import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { withRole } from '#tests/helpers/rbac'

test.group('Exception handler', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('E_AUTHORIZATION_FAILURE in JSON returns 403 with message', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).accept('json').redirects(0)

    response.assertStatus(403)
    assert.property(response.body(), 'message')
    assert.isString(response.body().message)
  })

  test('E_AUTHORIZATION_FAILURE in HTML redirects (classic flow)', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client.get('/users').loginAs(user).redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })

  test('E_INVALID_CREDENTIALS in JSON returns 401 with message', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'certa-123' }).create()

    const response = await client
      .post('/login')
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ email: user.email, password: 'errada' })

    response.assertStatus(401)
    assert.property(response.body(), 'message')
    assert.isString(response.body().message)
  })

  test('status pages send no error to the browser: neither the message nor the stack', async ({
    assert,
  }) => {
    const { default: HttpExceptionHandler } = await import('#core/exceptions/handler')
    const pages = (
      new HttpExceptionHandler() as unknown as {
        statusPages: Record<string, (error: unknown, ctx: unknown) => unknown>
      }
    ).statusPages
    const rendered: unknown[] = []
    const ctx = { inertia: { render: (_: string, props: unknown) => rendered.push(props) } }

    await pages['500..599'](new Error('database password: secret'), ctx)
    await pages['404'](new Error('internal route'), ctx)

    assert.deepEqual(rendered, [{}, {}])
  })
})
