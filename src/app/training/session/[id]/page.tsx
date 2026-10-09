'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  getWorkoutSessionWithSets,
  updateWorkoutSession,
  getExercises,
  addWorkoutSet,
  deleteWorkoutSet,
} from '@/lib/api/workout'
import type { WorkoutSession, WorkoutSet, Exercise } from '@/lib/supabase/types'
import { getMuscleGroupLabel, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, Trash2, Trophy, Check, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { RecordCelebration } from '@/components/training/RecordCelebration'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SessionPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSet, setShowAddSet] = useState(false)
  const [addingForExercise, setAddingForExercise] = useState<Exercise | null>(null)
  const [newRecord, setNewRecord] = useState<{ exerciseName: string } | null>(null)
  const [completing, setCompleting] = useState(false)

  // Set form state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [addingSet, setAddingSet] = useState(false)

  async function load() {
    try {
      const [{ session: s, sets: st }, exs] = await Promise.all([
        getWorkoutSessionWithSets(id),
        getExercises(),
      ])
      setSession(s)
      setSets(st)
      setExercises(exs)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Group sets by exercise
  const groupedSets = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
    const key = set.exercise_id
    if (!acc[key]) acc[key] = []
    acc[key].push(set)
    return acc
  }, {})

  async function handleAddSet() {
    if (!selectedExercise || !reps) {
      toast.error('Sélectionne un exercice et saisis des répétitions')
      return
    }
    setAddingSet(true)
    try {
      const exerciseSets = sets.filter((s) => s.exercise_id === selectedExercise.id)
      const setNumber = exerciseSets.length + 1
      const { set, isNewRecord } = await addWorkoutSet({
        session_id: id,
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name,
        set_number: setNumber,
        reps: parseInt(reps),
        weight_kg: weight ? parseFloat(weight) : undefined,
      })

      setSets((prev) => [...prev, set])

      if (isNewRecord) {
        setNewRecord({ exerciseName: selectedExercise.name })
        setTimeout(() => setNewRecord(null), 3000)
        toast.success('🏆 Nouveau record personnel !', { duration: 4000 })
      } else {
        toast.success('Série ajoutée ✓')
      }

      setReps('')
      setWeight('')
    } catch {
      toast.error('Erreur')
    } finally {
      setAddingSet(false)
    }
  }

  async function handleDeleteSet(setId: string) {
    try {
      await deleteWorkoutSet(setId)
      setSets((prev) => prev.filter((s) => s.id !== setId))
      toast.success('Série supprimée')
    } catch {
      toast.error('Erreur')
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await updateWorkoutSession(id, { completed: true })
      toast.success('Séance terminée ! 💪🏆', { duration: 3000 })
      router.push('/training')
    } catch {
      toast.error('Erreur')
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const exercisesUsed = exercises.filter((e) => groupedSets[e.id])
  const exercisesNotUsed = exercises.filter((e) => !groupedSets[e.id])

  return (
    <div className="animate-fade-in">
      {/* Record celebration overlay */}
      {newRecord && <RecordCelebration exerciseName={newRecord.exerciseName} />}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <ChevronLeft size={18} className="text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-lg font-bold truncate max-w-[200px]">{session.name}</h1>
              <p className="text-xs text-text-muted">{formatDate(session.session_date)}</p>
            </div>
          </div>
          {!session.completed && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex items-center gap-1.5 bg-accent-green text-bg-primary px-3 py-2 rounded-xl text-sm font-medium"
            >
              <Check size={16} />
              Terminer
            </button>
          )}
          {session.completed && (
            <span className="badge bg-accent-green/10 text-accent-green border border-accent-green/20">
              ✓ Terminée
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Add set panel */}
        {!session.completed && (
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Plus size={16} className="text-accent-purple" />
              Ajouter une série
            </h3>

            {/* Exercise selector */}
            <div className="mb-3">
              <label className="label">Exercice</label>
              <select
                className="select-field"
                value={selectedExercise?.id ?? ''}
                onChange={(e) => {
                  const ex = exercises.find((x) => x.id === e.target.value) ?? null
                  setSelectedExercise(ex)
                }}
              >
                <option value="">— Choisir un exercice —</option>
                {exercisesUsed.length > 0 && (
                  <optgroup label="Déjà dans cette séance">
                    {exercisesUsed.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </optgroup>
                )}
                {exercisesNotUsed.length > 0 && (
                  <optgroup label="Autres exercices">
                    {exercisesNotUsed.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">Répétitions *</label>
                <input
                  type="number"
                  min="1"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="input-field text-center text-lg font-bold"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="label">Poids (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input-field text-center text-lg font-bold"
                  placeholder="60"
                />
              </div>
            </div>

            <button
              onClick={handleAddSet}
              disabled={addingSet || !selectedExercise}
              className="btn-primary w-full"
              style={{ backgroundColor: '#a855f7' }}
            >
              {addingSet ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                '+ Ajouter la série'
              )}
            </button>
          </div>
        )}

        {/* Exercises with sets */}
        {Object.keys(groupedSets).length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-4xl mb-2">🏋️</p>
            <p className="text-text-secondary text-sm">Aucune série enregistrée</p>
          </div>
        ) : (
          Object.entries(groupedSets).map(([exerciseId, exSets]) => {
            const exercise = exercises.find((e) => e.id === exerciseId)
            const hasRecord = exSets.some((s) => s.is_personal_record)
            return (
              <div key={exerciseId} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {hasRecord && <Trophy size={14} className="text-accent-yellow" />}
                    <h3 className="font-semibold text-text-primary">
                      {exSets[0].exercise_name}
                    </h3>
                  </div>
                  <Link
                    href={`/training/progress/${exerciseId}`}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-green transition-colors"
                  >
                    <TrendingUp size={12} />
                    Progression
                  </Link>
                </div>

                {/* Sets table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 text-[10px] text-text-muted uppercase tracking-wider px-2">
                    <span>Série</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">Poids</span>
                    <span className="text-center">Vol.</span>
                  </div>
                  {exSets.map((set) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-4 items-center px-3 py-2.5 rounded-xl ${
                        set.is_personal_record
                          ? 'bg-accent-yellow/10 border border-accent-yellow/20'
                          : 'bg-bg-secondary'
                      }`}
                    >
                      <span className="text-sm font-medium text-text-secondary">
                        {set.is_personal_record ? '🏆' : `#${set.set_number}`}
                      </span>
                      <span className="text-center text-sm font-bold text-text-primary">{set.reps ?? '—'}</span>
                      <span className="text-center text-sm font-bold text-accent-purple">
                        {set.weight_kg ? `${set.weight_kg}kg` : '—'}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                          {set.weight_kg && set.reps ? `${Math.round(set.weight_kg * set.reps)}` : '—'}
                        </span>
                        {!session.completed && (
                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            className="text-text-muted hover:text-accent-red transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise summary */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Séries</p>
                    <p className="text-sm font-bold text-text-primary">{exSets.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Volume total</p>
                    <p className="text-sm font-bold text-accent-purple">
                      {exSets.reduce((s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)} kg
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Max</p>
                    <p className="text-sm font-bold text-accent-green">
                      {Math.max(...exSets.map((s) => s.weight_kg ?? 0))} kg
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Session notes */}
        {session.notes && (
          <div className="card bg-bg-elevated">
            <p className="text-xs text-text-muted mb-1">Notes de séance</p>
            <p className="text-sm text-text-secondary">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
