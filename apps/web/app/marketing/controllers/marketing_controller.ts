import type { HttpContext } from '@adonisjs/core/http'

export default class MarketingController {
  public async handle({ inertia }: HttpContext) {
    return inertia.render('marketing/show')
  }
}
