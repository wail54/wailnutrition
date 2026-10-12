'use client'

import { useEffect, useState } from 'react'
import { getWeeklyMealLogs } from '@/lib/api/nutrition'
import { getWeekDates, formatDate } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface WeeklyChartProps {
  calorieGoal: number
}

interface DayData {
  day: string
  calories: number
  date: string
}

export function WeeklyChart({ calorieGoal }: WeeklyChartProps) {
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const weekDates = getWeekDates()
      const startDate = formatDate(weekDates[0], 'yyyy-MM-dd')
      const endDate = formatDate(weekDates[6], 'yyyy-MM-dd')

      try {
        const logs = await getWeeklyMealLogs(startDate, endDate)

        const dayMap: Record<string, number> = {}
        logs.forEach((log) => {
          dayMap[log.logged_date] = (dayMap[log.logged_date] || 0) + log.calories
        })

        const chartData = weekDates.map((d) => {
          const dateStr = formatDate(d, 'yyyy-MM-dd')
          return {
            day: formatDate(d, 'EEE'),
            calories: Math.round(dayMap[dateStr] || 0),
            date: dateStr,
          }
        })

        setData(chartData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="h-32 bg-bg-secondary animate-pulse rounded-xl" />
  }

  const today = formatDate(new Date(), 'yyyy-MM-dd')

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tick={{ fill: '#8888aa', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8888aa', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v > 0 ? `${v}` : ''}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a27',
            border: '1px solid #2a2a40',
            borderRadius: '10px',
            color: '#f0f0f5',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v} kcal`, 'Calories']}
          labelStyle={{ color: '#8888aa' }}
          cursor={false}
        />
        <ReferenceLine
          y={calorieGoal}
          stroke="#22c55e"
          strokeDasharray="4 3"
          strokeOpacity={0.5}
        />
        <Bar
          dataKey="calories"
          radius={[6, 6, 0, 0]}
          fill="#3b82f6"
          activeBar={{ fill: '#22c55e' }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
