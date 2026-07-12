import { PERIOD_STEPS, type Period } from '#analytics/enums/period'

export type RevenueMetrics = {
  revenue: {
    value: number
    change: number
    trend: number[]
    format: 'currency'
  }
  chart: number[]
}

export interface GetRevenueMetricsInput {
  period: Period
}

const CHANGE_BY_PERIOD: Record<Period, number> = {
  '7d': 2.1,
  '30d': 12.5,
  '90d': 34.2,
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
export default class GetRevenueMetrics {
  async handle({ period }: GetRevenueMetricsInput): Promise<RevenueMetrics> {
    const steps = PERIOD_STEPS[period]
    return {
      revenue: {
        value: 18420,
        change: CHANGE_BY_PERIOD[period],
        trend: walk(15000, 18420, steps, 250),
        format: 'currency',
      },
      chart: walk(15000, 18420, steps, 250),
    }
  }
}
