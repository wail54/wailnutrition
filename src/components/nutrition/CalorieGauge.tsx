'use client'

import { getProgressColor } from '@/lib/utils'

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

  const r = 52
  const circumference = 2 * Math.PI * r
  const strokeDash = (percent / 100) * circumference

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-44 h-44 rounded-full bg-bg-secondary animate-pulse" />
        <div className="h-4 w-32 bg-bg-secondary animate-pulse rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Circle */}
      <div className="relative w-44 h-44 mb-5">
        {/* Glow behind */}
        <div className="absolute inset-4 rounded-full blur-xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: color }} />

        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e1e2e" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}90)` }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-text-primary leading-none tabular-nums">
            {current.toLocaleString('fr-FR')}
          </span>
          <span className="text-text-muted text-sm mt-1 font-medium">kcal</span>
          <span className="text-xs text-text-secondary mt-0.5">/ {goal.toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-3 gap-1">
        <div className="text-center py-2">
          <p className="text-xs text-text-muted">Consommé</p>
          <p className="text-sm font-bold mt-0.5" style={{ color }}>{current} kcal</p>
        </div>
        <div className="text-center py-2 border-x border-border">
          <p className="text-xs text-text-muted">Objectif</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{goal} kcal</p>
        </div>
        <div className="text-center py-2">
          {over > 0 ? (
            <>
              <p className="text-xs text-text-muted">Dépassé</p>
              <p className="text-sm font-bold text-accent-red mt-0.5">+{over} kcal</p>
            </>
          ) : (
            <>
              <p className="text-xs text-text-muted">Restant</p>
              <p className="text-sm font-bold text-accent-green mt-0.5">{remaining} kcal</p>
            </>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="w-full mt-3 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  )
}
