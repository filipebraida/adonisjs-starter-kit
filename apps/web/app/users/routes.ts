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

router
  .resource('/users', UsersController)
  .only(['index', 'store', 'update', 'destroy'])
  .use('*', middleware.auth())

router.post('/users/invite', [InviteController]).middleware(middleware.auth())
router
  .post('/users/impersonate/:id', [ImpersonatesController, 'store'])
  .middleware(middleware.auth())

router
  .get('/settings', ({ response }) => {
    return response.redirect().toRoute('profile.show')
  })
  .middleware(middleware.auth())

router.put('/settings/profile', [ProfileController]).middleware(middleware.auth())
router
  .get('/settings/profile', [ProfileController, 'show'])
  .middleware(middleware.auth())
  .as('profile.show')

router.put('/settings/password', [PasswordController]).middleware(middleware.auth())
router
  .get('/settings/password', [PasswordController, 'show'])
  .middleware(middleware.auth())
  .as('password.show')
