/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

const MarketingController = () => import('#marketing/controllers/marketing_controller')

router.get('/', [MarketingController]).as('marketing.show')
