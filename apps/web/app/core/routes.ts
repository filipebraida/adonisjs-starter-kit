import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router.get('/health/live', [controllers.core.Liveness]).as('health.live')
router.get('/health/ready', [controllers.core.Readiness]).as('health.ready')
router.get('/more', [controllers.core.More]).use(middleware.auth()).as('more')
