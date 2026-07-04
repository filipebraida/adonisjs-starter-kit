import { ArrowDown, ArrowUp } from 'lucide-react'

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'

import { Sparkline } from '#analytics/ui/components/sparkline'

interface KpiCardProps {
  label: string
  value: string
  change: number
  data: readonly number[]
}

// A KPI cell: label + big value on top, change badge + sparkline at the bottom.
// Compose these in a grid to build the dashboard overview row.
export function KpiCard({ label, value, change, data }: KpiCardProps) {
  const positive = change >= 0
  const Arrow = positive ? ArrowUp : ArrowDown
  const sign = positive ? '+' : ''

  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium tabular-nums',
            positive ? 'text-emerald-500' : 'text-rose-500'
          )}
        >
          <Arrow className="size-3" />
          {sign}
          {change}%
        </span>
        <Sparkline data={data} positive={positive} className="w-24 h-8" />
      </CardFooter>
    </Card>
  )
}
