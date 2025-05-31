/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const SignInController = () => import('#auth/controllers/sign_in_controller')
const SignOutController = () => import('#auth/controllers/sign_out_controller')
const SignUpController = () => import('#auth/controllers/sign_up_controller')
const ForgotPasswordController = () => import('#auth/controllers/forgot_password_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')
const SocialController = () => import('#auth/controllers/social_controller')

router.get('/login', [SignInController, 'show']).use(middleware.guest()).as('auth.sign_in.show')
router.post('/login', [SignInController])
router.get('/logout', [SignOutController]).as('auth.sign_out.show')

router.get('/sign-up', [SignUpController, 'show']).use(middleware.guest()).as('auth.sign_up.show')

router.post('/sign-up', [SignUpController]).use(middleware.guest()).as('auth.sign_up.handle')
router
  .get('/forgot-password', [ForgotPasswordController, 'show'])
  .as('auth.forgot_password.show')
  .use(middleware.guest())
router.post('/forgot-password', [ForgotPasswordController]).as('auth.forgot_password.handle')
router
  .get('/reset-password/:token', [ResetPasswordController, 'show'])
  .use(middleware.guest())
  .as('auth.reset_password.show')
router
  .post('/reset-password/:token', [ResetPasswordController])
  .use(middleware.guest())
  .as('auth.reset_password.handle')

router
  .get('/:provider/redirect', [SocialController, 'redirect'])
  .where('provider', /google/)
  .as('social.create')
router.get('/:provider/callback', [SocialController, 'callback']).where('provider', /google/)
