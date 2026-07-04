import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { returnToKey } from '#auth/middleware/auth_middleware'
import { UserFactory } from '#users/database/factories/user'

const email = 'alice@example.test'
const password = 'senha-secreta-123'

test.group('Endpoint /login', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('estabelece sessao autenticada com credenciais validas', async ({ client, assert }) => {
    const user = await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    // Session key `auth_web` holds the user id — that's what the guard reads on subsequent requests.
    assert.equal(response.session().auth_web, user.id)
  })

  test('respeita returnTo interno seguro salvo na sessao', async ({ client, assert }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .withSession({ [returnToKey]: '/settings' })
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/settings')
  })

  test('descarta returnTo com URL externa e cai no dashboard', async ({ client, assert }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .withSession({ [returnToKey]: 'http://evil.example/steal' })
      .json({ email, password })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
  })

  test('credenciais invalidas: nao estabelece sessao', async ({ client, assert }) => {
    await UserFactory.merge({ email, password }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password: 'senha-errada' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
    assert.isUndefined(response.session().auth_web)
  })

  test('rejeita payload sem email/senha', async ({ client }) => {
    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .accept('json')
      .json({})

    response.assertStatus(422)
  })

  test('sincroniza cookie user-locale a partir de user.locale ao logar', async ({ client }) => {
    await UserFactory.merge({ email, password, locale: 'pt' }).create()

    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .json({ email, password })

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')
  })
})
