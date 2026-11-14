import type { HttpContext } from '@adonisjs/core/http'

import { DEFAULT_PERIOD } from '#analytics/enums/period'
import GetRevenueMetrics from '#analytics/queries/get_revenue_metrics'
import GetSubscriptionMetrics from '#analytics/queries/get_subscription_metrics'
import GetUserMetrics from '#analytics/queries/get_user_metrics'
import DashboardPolicy from '#analytics/policies/dashboard_policy'
import { dashboardQueryValidator } from '#analytics/validators/dashboard'

/** The analytics dashboard: revenue, user and subscription metrics for a period. */
export default class DashboardController {
  public async handle({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(DashboardPolicy).authorize('view')

    const payload = await request.validateUsing(dashboardQueryValidator, { data: request.qs() })
    const period = payload.period ?? DEFAULT_PERIOD

    const [revenue, users, subscriptions] = await Promise.all([
      new GetRevenueMetrics().handle({ period }),
      new GetUserMetrics().handle({ period }),
      new GetSubscriptionMetrics().handle({ period }),
    ])

    return inertia.render('analytics/dashboard', { period, revenue, users, subscriptions })
  }
}
