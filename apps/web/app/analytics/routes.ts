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

const { Dashboard } = controllers.analytics

router.get('/dashboard', [Dashboard]).middleware(middleware.auth()).as('dashboard.show')
