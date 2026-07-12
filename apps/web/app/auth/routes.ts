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

const { SignIn, SignOut, SignUp, ForgotPassword, ResetPassword, Social } = controllers.auth

router.get('/login', [SignIn, 'show']).use(middleware.guest()).as('auth.sign_in.show')
router.post('/login', [SignIn]).as('auth.sign_in.handle')
router.post('/logout', [SignOut]).as('auth.sign_out.handle')

router.get('/sign-up', [SignUp, 'show']).use(middleware.guest()).as('auth.sign_up.show')

router.post('/sign-up', [SignUp]).use(middleware.guest()).as('auth.sign_up.handle')
router
  .get('/forgot-password', [ForgotPassword, 'show'])
  .as('auth.forgot_password.show')
  .use(middleware.guest())
router.post('/forgot-password', [ForgotPassword]).as('auth.forgot_password.handle')
router
  .get('/reset-password/:token', [ResetPassword, 'show'])
  .use(middleware.guest())
  .as('auth.reset_password.show')
router
  .post('/reset-password/:token', [ResetPassword])
  .use(middleware.guest())
  .as('auth.reset_password.handle')

router
  .get('/:provider/redirect', [Social, 'redirect'])
  .where('provider', /google/)
  .as('social.create')
router.get('/:provider/callback', [Social, 'callback']).where('provider', /google/)
router
  .post('/switch/:locale', () => {})
  .use(middleware.switchLocale())
  .as('locale.switch')
