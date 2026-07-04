import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ResetPasswordToken from '#users/models/reset_password_token'
import User from '#users/models/user'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users/invite', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  let fake: ReturnType<typeof emitter.fake>
  group.each.setup(() => {
    fake = emitter.fake(['user:registered'])
    return () => emitter.restore()
  })

  test('POST sem auth redireciona para login', async ({ client, assert }) => {
    const response = await client
      .post('/users/invite')
      .withCsrfToken()
      .redirects(0)
      .json({ email: 'x@example.test', role: ROLES.USER })
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('POST como user comum eh barrado e nao emite evento', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client
      .post('/users/invite')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .json({ email: 'barrado-convite@example.test', role: ROLES.USER })

    assertForbiddenRedirect(response)
    fake.assertNoneEmitted()
    assert.isNull(await User.findBy('email', 'barrado-convite@example.test'))
  })

  test('POST como admin cria user + gera token + emite evento', async ({ client, assert }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/users/invite')
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({
        email: 'convite@example.test',
        role: ROLES.USER,
        description: 'seja bem-vindo',
      })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/users')

    const criado = await User.findByOrFail('email', 'convite@example.test')
    assert.equal(criado.email, 'convite@example.test')
    const roles = await criado.related('roles').query().select('name')
    assert.deepEqual(
      roles.map((r) => r.name),
      [ROLES.USER]
    )
    const token = await ResetPasswordToken.query().where('userId', criado.id).firstOrFail()
    assert.isNotEmpty(token.token)

    fake.assertEmitted('user:registered')
  })

  test('POST como admin com email duplicado retorna 422', async ({ client }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    await UserFactory.merge({ email: 'ja-existe@example.test' }).create()

    const response = await client
      .post('/users/invite')
      .loginAs(admin)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ email: 'ja-existe@example.test', role: ROLES.USER })

    response.assertStatus(422)
    fake.assertNoneEmitted()
  })
})
