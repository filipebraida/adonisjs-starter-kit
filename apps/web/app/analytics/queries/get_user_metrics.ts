import { PERIOD_STEPS, type Period } from '#analytics/enums/period'

export type UserMetrics = {
  activeUsers: {
    value: number
    change: number
    trend: number[]
    format: 'number'
  }
  signupsChart: number[]
}

export interface GetUserMetricsInput {
  period: Period
}

const ACTIVE_CHANGE_BY_PERIOD: Record<Period, number> = {
  '7d': 0.8,
  '30d': 3.2,
  '90d': 11.4,
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
export default class GetUserMetrics {
  async handle({ period }: GetUserMetricsInput): Promise<UserMetrics> {
    const steps = PERIOD_STEPS[period]
    return {
      activeUsers: {
        value: 1284,
        change: ACTIVE_CHANGE_BY_PERIOD[period],
        trend: walk(1150, 1284, steps, 12),
        format: 'number',
      },
      signupsChart: walk(40, 110, steps, 6),
    }
  }
}
