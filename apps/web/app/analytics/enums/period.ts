export const PERIODS = ['7d', '30d', '90d'] as const

export type Period = (typeof PERIODS)[number]

export const DEFAULT_PERIOD: Period = '30d'

export const PERIOD_STEPS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}
