'use client'

import { useEffect, useState } from 'react'
import { getWorkoutSessions, deleteWorkoutSession } from '@/lib/api/workout'
import type { WorkoutSession } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Plus, Dumbbell, Trash2, ChevronRight, Calendar, Trophy, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrainingPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await getWorkoutSessions(20)
      setSessions(data)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    try {
      await deleteWorkoutSession(id)
      toast.success('Séance supprimée')
      load()
    } catch { toast.error('Erreur') }
  }

  const completed = sessions.filter((s) => s.completed).length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-5">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-primary">Entraînement</h1>
            <p className="text-sm text-text-muted mt-0.5">{sessions.length} séance{sessions.length !== 1 ? 's' : ''} · {completed} terminée{completed !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/training/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#a855f7,#6d28d9)', boxShadow: '0 8px 20px rgba(168,85,247,0.35)' }}
          >
            <Plus size={16} />
            Séance
          </Link>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">

        {/* Quick nav */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: '/training/new', icon: Plus, label: 'Séance', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
            { href: '/training/calendar', icon: Calendar, label: 'Calendrier', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
            { href: '/training/exercises', icon: Dumbbell, label: 'Exercices', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
            { href: '/training/records', icon: Trophy, label: 'Records', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl border border-border active:scale-95 transition-transform"
              style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
              <span className="text-[10px] font-semibold text-text-secondary leading-tight text-center">{label}</span>
            </Link>
          ))}
        </div>

        {/* Sessions */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-bg-card animate-pulse rounded-2xl" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card text-center py-14">
            <p className="text-5xl mb-4">💪</p>
            <p className="text-text-secondary font-medium mb-1">Aucune séance encore</p>
            <p className="text-text-muted text-sm mb-4">Lance ta première séance !</p>
            <Link href="/training/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#a855f7,#6d28d9)' }}>
              <Plus size={15} /> Créer une séance
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="section-title">Historique</p>
            {sessions.map((session) => (
              <div key={session.id} className="card flex items-center gap-3">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${session.completed ? 'bg-accent-green/10' : 'bg-accent-purple/10'}`}>
                  {session.name.split(' ')[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary truncate">
                      {session.name.replace(/^[^\s]+\s/, '')}
                    </p>
                    {session.completed && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-green/15 text-accent-green">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted capitalize">
                    {format(new Date(session.session_date + 'T12:00'), 'EEEE d MMM', { locale: fr })}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleDelete(session.id)} className="p-2 text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <Link href={`/training/session/${session.id}`} className="p-2 text-text-muted hover:text-text-primary">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
