'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkoutSession } from '@/lib/api/workout'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ChevronLeft, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { getTodayDate } from '@/lib/utils'

interface SessionForm {
  name: string
  session_date: string
  notes: string
}

const SESSION_TEMPLATES = [
  { label: '🫀 Cardio', name: 'Cardio' },
  { label: '💪 Push (Poitrine / Épaules / Triceps)', name: 'Push — Poitrine / Épaules / Triceps' },
  { label: '🏋️ Pull (Dos / Biceps)', name: 'Pull — Dos / Biceps' },
  { label: '🦵 Legs (Jambes)', name: 'Legs — Jambes' },
  { label: '⚡ Full Body', name: 'Full Body' },
  { label: '🔥 HIIT', name: 'HIIT' },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch } = useForm<SessionForm>({
    defaultValues: { session_date: getTodayDate() },
  })

  async function onSubmit(data: SessionForm) {
    setLoading(true)
    try {
      const session = await createWorkoutSession({
        name: data.name,
        session_date: data.session_date,
        notes: data.notes || undefined,
      })
      toast.success('Séance créée ! 💪')
      router.push(`/training/session/${session.id}`)
    } catch {
      toast.error('Erreur lors de la création')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <h1 className="text-xl font-bold">Nouvelle séance</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Templates */}
        <div className="mb-4">
          <p className="section-title">Choisir un template</p>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setValue('name', t.name)}
                className={`text-left p-3 rounded-xl border text-sm transition-all active:scale-95 ${
                  watch('name') === t.name
                    ? 'bg-accent-purple/10 border-accent-purple/50 text-accent-purple'
                    : 'bg-bg-secondary border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nom de la séance *</label>
            <input
              {...register('name', { required: true })}
              className="input-field"
              placeholder="Ma séance du jour"
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              {...register('session_date')}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Notes (optionnel)</label>
            <textarea
              {...register('notes')}
              className="input-field resize-none"
              rows={3}
              placeholder="Objectifs, état de forme..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-purple text-white"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Dumbbell size={18} /> Créer et commencer</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
