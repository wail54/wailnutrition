'use client'

interface MacroRingProps {
  protein: number
  carbs: number
  fat: number
  loading?: boolean
}

const MACROS = [
  { key: 'protein' as const, label: 'Protéines', color: '#3b82f6', unit: 'g', emoji: '💪', bg: 'rgba(59,130,246,0.1)' },
  { key: 'carbs' as const, label: 'Glucides', color: '#eab308', unit: 'g', emoji: '⚡', bg: 'rgba(234,179,8,0.1)' },
  { key: 'fat' as const, label: 'Lipides', color: '#f97316', unit: 'g', emoji: '🔥', bg: 'rgba(249,115,22,0.1)' },
]

export function MacroRing({ protein, carbs, fat, loading }: MacroRingProps) {
  const values = { protein, carbs, fat }
  const totalKcal = protein * 4 + carbs * 4 + fat * 9

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 bg-bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {MACROS.map(({ key, label, color, unit, emoji, bg }) => {
        const val = values[key]
        const kcal = key === 'fat' ? val * 9 : val * 4
        const pct = totalKcal > 0 ? Math.round((kcal / totalKcal) * 100) : 0

        return (
          <div key={key}
            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 relative overflow-hidden"
            style={{ backgroundColor: bg }}
          >
            {/* Subtle glow */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full blur-xl opacity-30"
              style={{ backgroundColor: color }} />

            <span className="text-2xl relative z-10">{emoji}</span>
            <div className="text-center relative z-10">
              <p className="text-xl font-black leading-none" style={{ color }}>
                {val}<span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
              </p>
              <p className="text-[10px] text-text-muted mt-1">{label}</p>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden relative z-10">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
            </div>
            <span className="text-[10px] font-semibold relative z-10" style={{ color }}>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
