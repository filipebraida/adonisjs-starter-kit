import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ResetPasswordToken from '#auth/models/reset_password_token'
import User from '#auth/models/user'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { assertForbiddenRedirect } from '#tests/helpers/http'
import { marker, taggedEmail } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('Endpoint /users/invite', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('POST sem auth redireciona para login', async ({ client, assert }) => {
    const response = await client
      .post('/users/invite')
      .withCsrfToken()
      .redirects(0)
      .json({ email: 'x@example.test', role: ROLES.USER })
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('POST como user comum eh barrado e nao emite evento', async ({ client, db }) => {
    using fake = emitter.fake(['user:registered'])
    const email = taggedEmail(marker('barrado-convite'))
    const user = await UserFactory.create()
    await withRole(user, ROLES.USER)

    const response = await client
      .post('/users/invite')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .json({ email, role: ROLES.USER })

    assertForbiddenRedirect(response)
    fake.assertNoneEmitted()
    await db.assertMissing('users', { email })
  })

  test('POST como admin cria user + gera token + emite evento', async ({ client, db, assert }) => {
    using fake = emitter.fake(['user:registered'])
    const email = taggedEmail(marker('convite'))
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const response = await client
      .post('/users/invite')
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
      .json({
        email,
        role: ROLES.USER,
        description: 'seja bem-vindo',
      })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/users')

    await db.assertHas('users', { email })

    const criado = await User.findByOrFail('email', email)
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
    using fake = emitter.fake(['user:registered'])
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    const existente = await UserFactory.create()

    const response = await client
      .post('/users/invite')
      .loginAs(admin)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .json({ email: existente.email, role: ROLES.USER })

    response.assertStatus(422)
    fake.assertNoneEmitted()
  })
})
