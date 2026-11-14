import type { HttpContext } from '@adonisjs/core/http'

/** The liveness probe: answers while the process serves requests, checking nothing else. */
export default class LivenessController {
  static readonly public = true

  async handle({ response }: HttpContext) {
    return response.ok({ status: 'live' })
  }
}
