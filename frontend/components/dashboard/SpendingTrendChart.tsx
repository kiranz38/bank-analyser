'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import type { ChartPoint } from './types'

interface SpendingTrendChartProps {
  data: ChartPoint[]
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 text-xs shadow-lg space-y-1.5">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const avg = data.reduce((s, d) => s + d.monthlyLeak, 0) / data.length

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `$${Math.round(v / 100) * 100}`}
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avg}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="monthlyLeak"
            name="Monthly Leak"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--destructive))', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="annualSavings"
            name="Annual Savings Potential"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(142, 71%, 45%)', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            hide={data.length < 2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
