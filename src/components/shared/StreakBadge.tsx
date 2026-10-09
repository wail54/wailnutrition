'use client'

import { getStreakEmoji } from '@/lib/utils'
import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const emoji = getStreakEmoji(streak)

  return (
    <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-3 py-1.5">
      <span className="text-lg leading-none">{emoji}</span>
      <div>
        <p className="text-xs text-text-muted leading-none">Streak</p>
        <p className="text-sm font-bold text-text-primary leading-tight">{streak}j</p>
      </div>
    </div>
  )
}
