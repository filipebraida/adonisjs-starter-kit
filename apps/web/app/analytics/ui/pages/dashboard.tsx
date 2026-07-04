import { useState } from 'react'

import { Button } from '@workspace/ui/components/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'

import AuthenticatedLayout from '#common/ui/components/authenticated_layout'
import { Main } from '#common/ui/components/main'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { KpiCard } from '#analytics/ui/components/kpi_card'
import { Sparkline } from '#analytics/ui/components/sparkline'

// Placeholder dashboard — showcases how to compose shadcn Card, Badge,
// Button, and an inline SVG Sparkline. Data is mocked inline; wire the
// period selector to a real backend query when replacing this page.

type Period = '7d' | '30d' | '90d'

const KPIS = {
  revenue: {
    value: '$18,420',
    change: { '7d': 2.1, '30d': 12.5, '90d': 34.2 },
    data: [16400, 16900, 16700, 17100, 17200, 17600, 17400, 17800, 18000, 17900, 18200, 18420],
  },
  activeUsers: {
    value: '1,284',
    change: { '7d': 0.8, '30d': 3.2, '90d': 11.4 },
    data: [1180, 1195, 1210, 1205, 1220, 1235, 1250, 1245, 1260, 1270, 1275, 1284],
  },
  subscriptions: {
    value: '312',
    change: { '7d': 1.4, '30d': 8.1, '90d': 22.6 },
    data: [280, 284, 289, 292, 295, 298, 300, 304, 306, 309, 311, 312],
  },
  churn: {
    value: '2.4%',
    change: { '7d': -0.1, '30d': -0.4, '90d': -1.2 },
    data: [3.1, 3.0, 3.0, 2.9, 2.8, 2.7, 2.7, 2.6, 2.6, 2.5, 2.5, 2.4],
  },
} as const

const REVENUE_SERIES = [
  16400, 16800, 17100, 17300, 17500, 17800, 17400, 17600, 17900, 18100, 17900, 18000, 18200, 18400,
  18100, 18300, 18500, 18420,
]

const SIGNUPS_SERIES = [40, 55, 48, 60, 72, 68, 75, 82, 78, 88, 91, 84, 96, 102, 99, 108, 115, 112]

const PERIODS: Period[] = ['7d', '30d', '90d']

export default function Page() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('30d')

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t('analytics.dashboard.breadcrumb') }]}>
      <Main>
        <div className="flex flex-1 flex-col gap-6 py-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('analytics.dashboard.title')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('analytics.dashboard.welcome')}</p>
            </div>
            <div className="inline-flex rounded-md border p-1" role="group">
              {PERIODS.map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-xs',
                    period === p && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                  onClick={() => setPeriod(p)}
                >
                  {t(`analytics.dashboard.period.${p}`)}
                </Button>
              ))}
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label={t('analytics.dashboard.kpi.revenue')}
              value={KPIS.revenue.value}
              change={KPIS.revenue.change[period]}
              data={KPIS.revenue.data}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.activeUsers')}
              value={KPIS.activeUsers.value}
              change={KPIS.activeUsers.change[period]}
              data={KPIS.activeUsers.data}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.subscriptions')}
              value={KPIS.subscriptions.value}
              change={KPIS.subscriptions.change[period]}
              data={KPIS.subscriptions.data}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.churn')}
              value={KPIS.churn.value}
              change={KPIS.churn.change[period]}
              data={KPIS.churn.data}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.dashboard.chart.revenueTitle')}</CardTitle>
                <CardDescription>
                  {t('analytics.dashboard.chart.revenueDescription')}
                </CardDescription>
              </CardHeader>
              <Sparkline data={REVENUE_SERIES} positive className="mx-4 mb-4 h-40 w-auto" />
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.dashboard.chart.signupsTitle')}</CardTitle>
                <CardDescription>
                  {t('analytics.dashboard.chart.signupsDescription')}
                </CardDescription>
              </CardHeader>
              <Sparkline data={SIGNUPS_SERIES} positive className="mx-4 mb-4 h-40 w-auto" />
            </Card>
          </section>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
