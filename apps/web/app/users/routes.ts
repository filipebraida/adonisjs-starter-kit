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

router
  .get('/users/invite', [controllers.users.Invite, 'show'])
  .middleware(middleware.auth())
  .as('users.invite.show')
router
  .post('/users/invite', [controllers.users.Invite, 'store'])
  .middleware(middleware.auth())
  .as('users.invite.handle')

router
  .post('/users/impersonate/:id', [controllers.users.ImpersonateUser])
  .where('id', router.matchers.number())
  .middleware(middleware.auth())
  .as('users.impersonate.handle')

router
  .get('/users/activity', [controllers.users.Activity, 'handle'])
  .middleware(middleware.auth())
  .as('users.activity')

router
  .resource('/users', controllers.users.Users)
  .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
  .where('id', router.matchers.number())
  .use('*', middleware.auth())
  .as('users')

router
  .get('/settings', [controllers.users.Settings, 'show'])
  .middleware(middleware.auth())
  .as('settings.index')

router
  .put('/settings/profile', [controllers.users.UpdateProfile])
  .middleware(middleware.auth())
  .as('profile.update')

router
  .put('/settings/password', [controllers.users.UpdatePassword])
  .middleware(middleware.auth())
  .as('password.update')

router
  .delete('/settings/tokens/:id', [controllers.users.Tokens, 'destroy'])
  .where('id', router.matchers.number())
  .middleware(middleware.auth())
  .as('tokens.destroy')

router
  .post('/settings/tokens', [controllers.users.Tokens, 'store'])
  .middleware(middleware.auth())
  .as('tokens.store')
