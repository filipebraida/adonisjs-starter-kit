import testUtils from '@adonisjs/core/services/test_utils'
import { AllyManager } from '@adonisjs/ally'
import { test } from '@japa/runner'
import sinon from 'sinon'

import User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

interface SocialUser {
  email: string
  name: string
  avatarUrl: string
}

function makeDriver(overrides: {
  accessDenied?: boolean
  stateMisMatch?: boolean
  hasError?: boolean
  user?: SocialUser
  redirect?: sinon.SinonSpy
}) {
  return {
    accessDenied: () => overrides.accessDenied ?? false,
    stateMisMatch: () => overrides.stateMisMatch ?? false,
    hasError: () => overrides.hasError ?? false,
    redirect: overrides.redirect ?? sinon.spy(),
    user: async () => overrides.user,
  } as unknown as ReturnType<AllyManager<any>['use']>
}

test.group('Endpoint /:provider (social)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('GET /google/redirect delega para ally.use(google).redirect()', async ({ client }) => {
    const redirect = sinon.spy()
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ redirect }))

    await client.get('/google/redirect').redirects(0)

    sinon.assert.calledOnce(redirect)
  })

  test('callback com accessDenied redireciona para /sign-up com flash', async ({
    client,
    assert,
  }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ accessDenied: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'auth.social.error.access_denied')
  })

  test('callback com stateMisMatch redireciona para /sign-up com flash', async ({
    client,
    assert,
  }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ stateMisMatch: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'auth.social.error.state_mismatch')
  })

  test('callback com hasError redireciona para /sign-up com flash', async ({ client, assert }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ hasError: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'auth.social.error.uknown')
  })

  test('callback sucesso cria novo user, autentica e vai pro /dashboard', async ({
    client,
    db,
    assert,
  }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(
      makeDriver({
        user: {
          email: 'social-novo@example.test',
          name: 'Social Novo',
          avatarUrl: 'https://cdn/x.png',
        },
      })
    )

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    await db.assertHas('users', {
      email: 'social-novo@example.test',
      full_name: 'Social Novo',
      avatar_url: 'https://cdn/x.png',
    })
    const user = await User.findByOrFail('email', 'social-novo@example.test')
    assert.equal(response.session().auth_web, user.id)
  })

  test('callback sucesso reusa user existente pelo email', async ({ client, db, assert }) => {
    const existente = await UserFactory.merge({ email: 'social-existe@example.test' }).create()
    sinon.stub(AllyManager.prototype, 'use').returns(
      makeDriver({
        user: {
          email: 'social-existe@example.test',
          name: 'Ignorado',
          avatarUrl: 'https://cdn/y.png',
        },
      })
    )

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    await db.assertHas('users', { email: 'social-existe@example.test' }, 1)
    assert.equal(response.session().auth_web, existente.id)
  })
})
