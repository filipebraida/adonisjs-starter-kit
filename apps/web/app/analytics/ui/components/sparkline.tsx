import { Line, LineChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: readonly number[]
  height?: number
}

export function Sparkline({ data, height = 32 }: SparklineProps) {
  if (data.length < 2) return null

  const chartData = data.map((y, i) => ({ i, y }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="natural"
          dataKey="y"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
