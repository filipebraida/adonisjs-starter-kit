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
  .get('/settings', ({ response }) => {
    return response.redirect().toRoute('profile.show')
  })
  .middleware(middleware.auth())
  .as('settings.index')

router
  .put('/settings/profile', [ProfileController])
  .middleware(middleware.auth())
  .as('profile.update')
router
  .get('/settings/profile', [ProfileController, 'show'])
  .middleware(middleware.auth())
  .as('profile.show')

router
  .resource('/settings/tokens', TokensController)
  .only(['index', 'destroy'])
  .middleware('*', middleware.auth())
  .as('tokens')

router
  .post('/api/tokens', [TokensController, 'store'])
  .middleware(middleware.auth())
  .as('tokens.store')

router
  .put('/settings/password', [PasswordController])
  .middleware(middleware.auth())
  .as('password.update')
router
  .get('/settings/password', [PasswordController, 'show'])
  .middleware(middleware.auth())
  .as('password.show')
router
  .get('/settings/appearance', ({ inertia }) => {
    return inertia.render('users/appearance', {})
  })
  .middleware(middleware.auth())
  .as('appearance.show')
