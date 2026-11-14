import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'

router.get('/health/live', [controllers.core.Liveness]).as('health.live')
router.get('/health/ready', [controllers.core.Readiness]).as('health.ready')
