'use client'

import { getProgressColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CalorieGaugeProps {
  current: number
  goal: number
  loading?: boolean
}

export function CalorieGauge({ current, goal, loading }: CalorieGaugeProps) {
  const percent = Math.min((current / goal) * 100, 100)
  const remaining = Math.max(goal - current, 0)
  const over = current > goal ? current - goal : 0
  const color = getProgressColor((current / goal) * 100)

  const circumference = 2 * Math.PI * 54 // radius 54
  const strokeDash = (percent / 100) * circumference

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-full bg-bg-secondary animate-pulse" />
        <div className="h-4 w-32 bg-bg-secondary animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Circular gauge */}
      <div className="relative w-44 h-44 mb-4">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#2a2a40"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary leading-none">
            {current.toLocaleString('fr-FR')}
          </span>
          <span className="text-text-muted text-sm mt-1">kcal</span>
          <span className="text-xs text-text-secondary mt-1">/ {goal.toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="w-full grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs text-text-muted">Consommé</p>
          <p className="text-sm font-semibold" style={{ color }}>{current} kcal</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-text-muted">Objectif</p>
          <p className="text-sm font-semibold text-text-primary">{goal} kcal</p>
        </div>
        <div className="text-center">
          {over > 0 ? (
            <>
              <p className="text-xs text-text-muted">Dépassé</p>
              <p className="text-sm font-semibold text-accent-red">+{over} kcal</p>
            </>
          ) : (
            <>
              <p className="text-xs text-text-muted">Restant</p>
              <p className="text-sm font-semibold text-accent-green">{remaining} kcal</p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full mt-3 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
