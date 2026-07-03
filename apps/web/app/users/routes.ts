/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UsersController = () => import('#users/controllers/users_controller')
const SettingsController = () => import('#users/controllers/settings_controller')
const ProfileController = () => import('#users/controllers/profile_controller')
const PasswordController = () => import('#users/controllers/password_controller')
const InviteController = () => import('#users/controllers/invite_controller')
const ImpersonatesController = () => import('#users/controllers/impersonates_controller')
const TokensController = () => import('#users/controllers/tokens_controller')

router
  .get('/users/invite', [InviteController, 'show'])
  .middleware(middleware.auth())
  .as('users.invite.show')
router
  .post('/users/invite', [InviteController, 'handle'])
  .middleware(middleware.auth())
  .as('users.invite.handle')

router
  .post('/users/impersonate/:id', [ImpersonatesController, 'store'])
  .middleware(middleware.auth())
  .as('users.impersonate.handle')

router
  .resource('/users', UsersController)
  .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
  .use('*', middleware.auth())
  .as('users')

router
  .get('/settings', [SettingsController, 'show'])
  .middleware(middleware.auth())
  .as('settings.index')

router
  .put('/settings/profile', [ProfileController, 'handle'])
  .middleware(middleware.auth())
  .as('profile.update')

router
  .put('/settings/password', [PasswordController, 'handle'])
  .middleware(middleware.auth())
  .as('password.update')

router
  .delete('/settings/tokens/:id', [TokensController, 'destroy'])
  .middleware(middleware.auth())
  .as('tokens.destroy')

router
  .post('/settings/tokens', [TokensController, 'store'])
  .middleware(middleware.auth())
  .as('tokens.store')
