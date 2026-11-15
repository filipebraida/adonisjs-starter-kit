import testUtils from '@adonisjs/core/services/test_utils'
import { AllyManager } from '@adonisjs/ally'
import { test } from '@japa/runner'
import sinon from 'sinon'

import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'

function makeDriver(overrides: {
  accessDenied?: boolean
  stateMisMatch?: boolean
  hasError?: boolean
  user?: { email: string; name: string; avatarUrl: string }
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

  test('GET /google/redirect delegates to ally.use(google).redirect()', async ({ client }) => {
    const redirect = sinon.spy()
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ redirect }))

    await client.get('/google/redirect').redirects(0)

    sinon.assert.calledOnce(redirect)
  })

  test('callback with accessDenied redirects to /sign-up with flash', async ({
    client,
    assert,
  }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ accessDenied: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'Sign-in with the provider was cancelled.')
  })

  test('callback with stateMisMatch redirects to /sign-up with flash', async ({
    client,
    assert,
  }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ stateMisMatch: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'The sign-in request expired. Try again.')
  })

  test('callback with hasError redirects to /sign-up with flash', async ({ client, assert }) => {
    sinon.stub(AllyManager.prototype, 'use').returns(makeDriver({ hasError: true }))

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/sign-up')
    response.assertFlashMessage('error', 'The provider could not sign you in. Try again.')
  })

  test('successful callback creates a new user, authenticates and goes to /dashboard', async ({
    client,
    db,
    assert,
  }) => {
    const email = taggedEmail(marker('social-novo'))
    sinon.stub(AllyManager.prototype, 'use').returns(
      makeDriver({
        user: {
          email,
          name: 'Social Novo',
          avatarUrl: 'https://cdn/x.png',
        },
      })
    )

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')

    await db.assertHas('users', {
      email,
      full_name: 'Social Novo',
      avatar_url: 'https://cdn/x.png',
    })
    const user = await User.findByOrFail('email', email)
    assert.equal(response.session().auth_web, user.id)
  })

  test('successful callback reuses the existing user by email', async ({ client, db, assert }) => {
    const existente = await UserFactory.create()
    sinon.stub(AllyManager.prototype, 'use').returns(
      makeDriver({
        user: {
          email: existente.email,
          name: 'Ignorado',
          avatarUrl: 'https://cdn/y.png',
        },
      })
    )

    const response = await client.get('/google/callback').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    await db.assertHas('users', { email: existente.email }, 1)
    assert.equal(response.session().auth_web, existente.id)
  })
})
