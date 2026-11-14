import type { HttpContext } from '@adonisjs/core/http'

import { healthChecks } from '#start/health'

/**
 * The readiness probe: 200 when the database answers and disk and heap are
 * within limits, 503 otherwise. The probe is public, so it answers only the
 * status; the full report, with its numbers, goes to the log.
 */
export default class ReadinessController {
  static readonly public = true

  async handle({ logger, response }: HttpContext) {
    const report = await healthChecks.run()
    if (report.isHealthy) return response.ok({ status: 'ready' })

    logger.warn({ report }, 'readiness check failed')
    return response.serviceUnavailable({ status: 'unavailable' })
  }
}
