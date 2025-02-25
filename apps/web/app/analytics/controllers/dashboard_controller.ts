import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  public async handle({ inertia }: HttpContext) {
    return inertia.render('analytics/dashboard')
  }
}
