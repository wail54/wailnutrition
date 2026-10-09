'use client'

interface MacroRingProps {
  protein: number
  carbs: number
  fat: number
  loading?: boolean
}

const MACROS = [
  { key: 'protein', label: 'Protéines', color: '#3b82f6', unit: 'g', emoji: '💪' },
  { key: 'carbs', label: 'Glucides', color: '#eab308', unit: 'g', emoji: '⚡' },
  { key: 'fat', label: 'Lipides', color: '#f97316', unit: 'g', emoji: '🔥' },
] as const

export function MacroRing({ protein, carbs, fat, loading }: MacroRingProps) {
  const values = { protein, carbs, fat }
  const total = protein * 4 + carbs * 4 + fat * 9 // calories from macros

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-bg-secondary animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {MACROS.map(({ key, label, color, unit, emoji }) => {
        const val = values[key]
        const kcal = key === 'fat' ? val * 9 : val * 4
        const pct = total > 0 ? Math.round((kcal / total) * 100) : 0
        return (
          <div
            key={key}
            className="flex flex-col items-center gap-2 bg-bg-secondary rounded-xl p-3"
          >
            <div className="text-xl">{emoji}</div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color }}>{val}<span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span></p>
              <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
            </div>
            {/* Mini bar */}
            <div className="w-full h-1 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] text-text-muted">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
