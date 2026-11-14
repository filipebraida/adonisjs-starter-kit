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

// A reset token is url-safe text; anything else 404s before the lookup.
const RESET_TOKEN = /^[\w-]+$/

router
  .get('/login', [controllers.auth.SignIn, 'show'])
  .use(middleware.guest())
  .as('auth.sign_in.show')
router.post('/login', [controllers.auth.SignIn, 'store']).as('auth.sign_in.handle')
router.post('/logout', [controllers.auth.SignOut]).as('auth.sign_out.handle')

router
  .get('/sign-up', [controllers.auth.SignUp, 'show'])
  .use(middleware.guest())
  .as('auth.sign_up.show')

router
  .post('/sign-up', [controllers.auth.SignUp, 'store'])
  .use(middleware.guest())
  .as('auth.sign_up.handle')
router
  .get('/forgot-password', [controllers.auth.ForgotPassword, 'show'])
  .as('auth.forgot_password.show')
  .use(middleware.guest())
router
  .post('/forgot-password', [controllers.auth.ForgotPassword, 'store'])
  .as('auth.forgot_password.handle')
router
  .get('/reset-password/:token', [controllers.auth.ResetPassword, 'show'])
  .where('token', RESET_TOKEN)
  .use(middleware.guest())
  .as('auth.reset_password.show')
router
  .post('/reset-password/:token', [controllers.auth.ResetPassword, 'store'])
  .where('token', RESET_TOKEN)
  .use(middleware.guest())
  .as('auth.reset_password.handle')

router
  .get('/:provider/redirect', [controllers.auth.RedirectToProvider])
  .where('provider', /google/)
  .as('social.create')
router
  .get('/:provider/callback', [controllers.auth.AuthenticateWithSocial])
  .where('provider', /google/)
  .as('social.callback')
router
  .post('/switch/:locale', () => {})
  .where('locale', /^[a-z]{2}(-[A-Z]{2})?$/)
  .use(middleware.switchLocale())
  .as('locale.switch')
