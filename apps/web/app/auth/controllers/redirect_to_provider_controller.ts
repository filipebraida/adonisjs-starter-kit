import type { HttpContext } from '@adonisjs/core/http'

/**
 * Sends the visitor to the social provider's consent screen.
 * Public: the visitor is signing in or up.
 */
export default class RedirectToProviderController {
  static readonly public = true

  async handle({ ally, params }: HttpContext) {
    return ally.use(params.provider).redirect()
  }
}
