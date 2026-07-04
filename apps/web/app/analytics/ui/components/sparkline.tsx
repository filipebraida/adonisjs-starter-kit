import { cn } from '@workspace/ui/lib/utils'

interface SparklineProps {
  data: readonly number[]
  positive?: boolean
  className?: string
}

// Tiny inline SVG sparkline. Zero deps — swap for recharts / visx if you
// need axes, tooltips, or interactivity.
export function Sparkline({ data, positive = true, className }: SparklineProps) {
  if (data.length < 2) return null

  const width = 100
  const height = 32
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data
    .map((value, i) => {
      const x = i * step
      const y = height - ((value - min) / range) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('overflow-visible', className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? 'stroke-emerald-500' : 'stroke-rose-500'}
      />
    </svg>
  )
}
