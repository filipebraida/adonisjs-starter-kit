import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint POST /switch/:locale', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('seta cookie user-locale para locale suportado (pt)', async ({ client, assert }) => {
    const response = await client
      .post('/switch/pt')
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    response.assertCookie('user-locale', 'pt')
  })

  test('aceita en tambem', async ({ client }) => {
    const response = await client
      .post('/switch/en')
      .withCsrfToken()
      .header('referer', '/')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'en')
  })

  test('rejeita locale nao suportado (nao sobrescreve com xx)', async ({ client }) => {
    const response = await client
      .post('/switch/xx')
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'en')
  })

  test('sem referer redireciona para /', async ({ client, assert }) => {
    const response = await client.post('/switch/pt').withCsrfToken().redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })

  test('user autenticado tem locale salvo no proprio user', async ({ client, assert }) => {
    const user = await UserFactory.merge({ locale: null }).create()

    const response = await client
      .post('/switch/pt')
      .loginAs(user)
      .withCsrfToken()
      .header('referer', '/dashboard')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')

    await user.refresh()
    assert.equal(user.locale, 'pt')
  })

  test('user anonimo nao tenta persistir em user (so seta cookie)', async ({ client }) => {
    const response = await client
      .post('/switch/pt')
      .withCsrfToken()
      .header('referer', '/')
      .redirects(0)

    response.assertStatus(302)
    response.assertCookie('user-locale', 'pt')
  })
})
