import type { HttpContext } from '@adonisjs/core/http'

/** The landing page. Public: it is what a visitor sees first. */
export default class MarketingController {
  static readonly public = true

  public async handle({ inertia }: HttpContext) {
    return inertia.render('marketing/show', {})
  }
}
