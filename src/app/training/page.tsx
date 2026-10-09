'use client'

import { useEffect, useState } from 'react'
import { getWorkoutSessions, deleteWorkoutSession } from '@/lib/api/workout'
import type { WorkoutSession } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Dumbbell, Trash2, ChevronRight, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrainingPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await getWorkoutSessions(20)
      setSessions(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    try {
      await deleteWorkoutSession(id)
      toast.success('Séance supprimée')
      load()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Entraînement</h1>
          <div className="flex items-center gap-2">
            <Link href="/training/calendar" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <Calendar size={18} className="text-text-secondary" />
            </Link>
            <Link href="/training/new" className="flex items-center gap-1.5 bg-accent-purple text-white px-3 py-2 rounded-xl text-sm font-medium">
              <Plus size={16} />
              Séance
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/training/exercises" className="card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-accent-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Exercices</p>
              <p className="text-xs text-text-muted">Bibliothèque</p>
            </div>
          </Link>
          <Link href="/training/records" className="card flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 bg-accent-yellow/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Records</p>
              <p className="text-xs text-text-muted">Mes PRs</p>
            </div>
          </Link>
        </div>

        {/* Sessions list */}
        <div>
          <p className="section-title">Séances ({sessions.length})</p>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 bg-bg-card animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-5xl mb-4">💪</p>
              <p className="text-text-secondary mb-3">Aucune séance encore</p>
              <Link href="/training/new" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus size={16} />
                Créer une séance
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.completed ? 'bg-accent-green/10' : 'bg-accent-purple/10'
                    }`}>
                      {session.completed ? (
                        <span className="text-xl">✓</span>
                      ) : (
                        <Dumbbell size={18} className="text-accent-purple" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary truncate">{session.name}</p>
                        {session.completed && (
                          <span className="badge bg-accent-green/10 text-accent-green text-[10px]">Terminée</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-text-muted">{formatDate(session.session_date)}</span>
                        {session.duration_minutes && (
                          <span className="text-xs text-text-muted">⏱ {session.duration_minutes}min</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-2 text-text-muted hover:text-accent-red transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link href={`/training/session/${session.id}`} className="p-2 text-text-muted hover:text-text-primary">
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
