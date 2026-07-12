/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

const { Users, Settings, Profile, Password, Invite, Impersonates, Tokens } = controllers.users

router.get('/users/invite', [Invite, 'show']).middleware(middleware.auth()).as('users.invite.show')
router
  .post('/users/invite', [Invite, 'handle'])
  .middleware(middleware.auth())
  .as('users.invite.handle')

router
  .post('/users/impersonate/:id', [Impersonates, 'store'])
  .middleware(middleware.auth())
  .as('users.impersonate.handle')

router
  .resource('/users', Users)
  .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
  .use('*', middleware.auth())
  .as('users')

router.get('/settings', [Settings, 'show']).middleware(middleware.auth()).as('settings.index')

router
  .put('/settings/profile', [Profile, 'handle'])
  .middleware(middleware.auth())
  .as('profile.update')

router
  .put('/settings/password', [Password, 'handle'])
  .middleware(middleware.auth())
  .as('password.update')

router
  .delete('/settings/tokens/:id', [Tokens, 'destroy'])
  .middleware(middleware.auth())
  .as('tokens.destroy')

router.post('/settings/tokens', [Tokens, 'store']).middleware(middleware.auth()).as('tokens.store')
