import { PERIOD_STEPS, type Period } from '#analytics/enums/period'

export type SubscriptionMetrics = {
  subscriptions: {
    value: number
    change: number
    trend: number[]
    format: 'number'
  }
  churn: {
    value: number
    change: number
    trend: number[]
    format: 'percent'
  }
}

export interface GetSubscriptionMetricsInput {
  period: Period
}

const SUBS_CHANGE_BY_PERIOD: Record<Period, number> = {
  '7d': 1.4,
  '30d': 8.1,
  '90d': 22.6,
}

const CHURN_CHANGE_BY_PERIOD: Record<Period, number> = {
  '7d': -0.1,
  '30d': -0.4,
  '90d': -1.2,
}

function walk(from: number, to: number, steps: number, jitter: number): number[] {
  const out: number[] = []
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 1 : i / (steps - 1)
    const wiggle = Math.sin(i * 1.7) * jitter
    out.push(Math.round((from + (to - from) * t + wiggle) * 100) / 100)
  }
  return out
}

// Demo data — replace with real Lucid aggregates.
export default class GetSubscriptionMetrics {
  async handle({ period }: GetSubscriptionMetricsInput): Promise<SubscriptionMetrics> {
    const steps = PERIOD_STEPS[period]
    return {
      subscriptions: {
        value: 312,
        change: SUBS_CHANGE_BY_PERIOD[period],
        trend: walk(280, 312, steps, 3),
        format: 'number',
      },
      churn: {
        value: 2.4,
        change: CHURN_CHANGE_BY_PERIOD[period],
        trend: walk(3.1, 2.4, steps, 0.05),
        format: 'percent',
      },
    }
  }
}
