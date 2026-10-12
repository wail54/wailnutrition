'use client'

import { useRouter } from 'next/navigation'
import { createWorkoutSession } from '@/lib/api/workout'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { getTodayDate } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const SESSION_TEMPLATES = [
  { emoji: '💪', label: 'Push', sublabel: 'Poitrine · Épaules · Triceps', color: '#ef4444' },
  { emoji: '🏋️', label: 'Pull', sublabel: 'Dos · Biceps', color: '#3b82f6' },
  { emoji: '🦵', label: 'Legs', sublabel: 'Quadriceps · Fessiers · Mollets', color: '#a855f7' },
  { emoji: '⚡', label: 'Full Body', sublabel: 'Corps entier', color: '#eab308' },
  { emoji: '🫀', label: 'Cardio', sublabel: 'Endurance · Souffle', color: '#22c55e' },
  { emoji: '🔥', label: 'HIIT', sublabel: 'Haute intensité', color: '#f97316' },
  { emoji: '🧘', label: 'Mobilité', sublabel: 'Stretching · Récup', color: '#06b6d4' },
  { emoji: '🤸', label: 'Autre', sublabel: 'Séance libre', color: '#8b5cf6' },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      const tmpl = selected !== null ? SESSION_TEMPLATES[selected] : null
      const name = tmpl
        ? `${tmpl.emoji} ${tmpl.label} — ${format(new Date(), 'd MMM', { locale: fr })}`
        : `Séance du ${format(new Date(), 'd MMM', { locale: fr })}`

      const session = await createWorkoutSession({ name, session_date: getTodayDate() })
      toast.success('C\'est parti ! 💪')
      router.push(`/training/session/${session.id}`)
    } catch {
      toast.error('Erreur lors de la création')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Nouvelle séance</h1>
            <p className="text-xs text-text-muted capitalize">
              {format(new Date(), 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <p className="text-text-secondary text-sm">Quel type de séance ?</p>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3">
          {SESSION_TEMPLATES.map((tmpl, i) => (
            <button
              key={i}
              onClick={() => setSelected(i === selected ? null : i)}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 text-left ${
                selected === i
                  ? 'border-opacity-100'
                  : 'border-border bg-bg-card hover:border-border-light'
              }`}
              style={
                selected === i
                  ? {
                      borderColor: tmpl.color,
                      backgroundColor: `${tmpl.color}15`,
                      boxShadow: `0 0 20px ${tmpl.color}25`,
                    }
                  : {}
              }
            >
              {selected === i && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: tmpl.color }}
                >
                  ✓
                </div>
              )}
              <span className="text-3xl">{tmpl.emoji}</span>
              <div>
                <p className="font-bold text-text-primary text-sm">{tmpl.label}</p>
                <p className="text-[11px] text-text-muted leading-tight mt-0.5">{tmpl.sublabel}</p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: selected !== null
              ? `linear-gradient(135deg, ${SESSION_TEMPLATES[selected].color}, ${SESSION_TEMPLATES[selected].color}aa)`
              : 'linear-gradient(135deg, #a855f7, #6d28d9)',
            color: '#fff',
            boxShadow: selected !== null
              ? `0 8px 32px ${SESSION_TEMPLATES[selected].color}40`
              : '0 8px 32px rgba(168,85,247,0.3)',
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {selected !== null ? SESSION_TEMPLATES[selected].emoji : '🏋️'}
              {' '}Commencer la séance
            </>
          )}
        </button>
      </div>
    </div>
  )
}
