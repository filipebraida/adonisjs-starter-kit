import { router } from '@inertiajs/react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Button } from '@workspace/ui/components/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart'
import { cn } from '@workspace/ui/lib/utils'

import { urlFor } from '~/app/client'

import AuthenticatedLayout from '#common/ui/components/authenticated_layout'
import { Main } from '#common/ui/components/main'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { KpiCard } from '#analytics/ui/components/kpi_card'

import type { InertiaProps } from '#core/ui/types'
import { PERIODS, type Period } from '#analytics/enums/period'
import type { RevenueMetrics } from '#analytics/queries/get_revenue_metrics'
import type { SubscriptionMetrics } from '#analytics/queries/get_subscription_metrics'
import type { UserMetrics } from '#analytics/queries/get_user_metrics'

type PageProps = InertiaProps<{
  period: Period
  revenue: RevenueMetrics
  users: UserMetrics
  subscriptions: SubscriptionMetrics
}>

type Format = 'currency' | 'number' | 'percent'

function formatValue(value: number, format: Format, locale: string): string {
  if (format === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }
  if (format === 'percent') {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`
  }
  return new Intl.NumberFormat(locale).format(value)
}

const chartConfig = {
  value: { label: 'Value', color: 'var(--chart-1)' },
} satisfies ChartConfig

export default function Page({ period, revenue, users, subscriptions }: PageProps) {
  const { t, language } = useTranslation()

  const setPeriod = (next: Period) => {
    if (next === period) return
    router.get(
      urlFor('dashboard.show'),
      { period: next },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['period', 'revenue', 'users', 'subscriptions'],
      }
    )
  }

  const currency = (v: number) =>
    new Intl.NumberFormat(language, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v)

  const number = (v: number) => new Intl.NumberFormat(language).format(v)

  const revenueSeries = revenue.chart.map((y, i) => ({ i, value: y }))
  const signupsSeries = users.signupsChart.map((y, i) => ({ i, value: y }))

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
                  variant={period === p ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('text-xs', period !== p && 'text-muted-foreground')}
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
              value={formatValue(revenue.revenue.value, revenue.revenue.format, language)}
              change={revenue.revenue.change}
              data={revenue.revenue.trend}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.activeUsers')}
              value={formatValue(users.activeUsers.value, users.activeUsers.format, language)}
              change={users.activeUsers.change}
              data={users.activeUsers.trend}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.subscriptions')}
              value={formatValue(
                subscriptions.subscriptions.value,
                subscriptions.subscriptions.format,
                language
              )}
              change={subscriptions.subscriptions.change}
              data={subscriptions.subscriptions.trend}
            />
            <KpiCard
              label={t('analytics.dashboard.kpi.churn')}
              value={formatValue(subscriptions.churn.value, subscriptions.churn.format, language)}
              change={subscriptions.churn.change}
              data={subscriptions.churn.trend}
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
              <ChartContainer config={chartConfig} className="h-[220px] w-full px-4 pb-4">
                <AreaChart
                  accessibilityLayer
                  data={revenueSeries}
                  margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="i"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => currency(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey="value"
                    type="natural"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    fill="var(--color-value)"
                    fillOpacity={0.35}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.dashboard.chart.signupsTitle')}</CardTitle>
                <CardDescription>
                  {t('analytics.dashboard.chart.signupsDescription')}
                </CardDescription>
              </CardHeader>
              <ChartContainer config={chartConfig} className="h-[220px] w-full px-4 pb-4">
                <AreaChart
                  accessibilityLayer
                  data={signupsSeries}
                  margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="i"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => number(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey="value"
                    type="natural"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    fill="var(--color-value)"
                    fillOpacity={0.35}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            </Card>
          </section>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
