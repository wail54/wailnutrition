'use client'

import { useEffect, useState } from 'react'
import { getWorkoutSessionWithSets, updateWorkoutSession, getExercises, addWorkoutSet, deleteWorkoutSet } from '@/lib/api/workout'
import type { WorkoutSession, WorkoutSet, Exercise } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, Trash2, Trophy, Check, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { RecordCelebration } from '@/components/training/RecordCelebration'

interface PageProps { params: { id: string } }

export default function SessionPage({ params }: PageProps) {
  const { id } = params

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [newRecord, setNewRecord] = useState<{ exerciseName: string } | null>(null)
  const [completing, setCompleting] = useState(false)
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
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const groupedSets = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
    if (!acc[set.exercise_id]) acc[set.exercise_id] = []
    acc[set.exercise_id].push(set)
    return acc
  }, {})

  async function handleAddSet() {
    if (!selectedExercise || !reps) { toast.error('Choisis un exercice et des reps'); return }
    setAddingSet(true)
    try {
      const setNumber = (sets.filter((s) => s.exercise_id === selectedExercise.id).length) + 1
      const { set, isNewRecord } = await addWorkoutSet({
        session_id: id, exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name, set_number: setNumber,
        reps: parseInt(reps), weight_kg: weight ? parseFloat(weight) : undefined,
      })
      setSets((prev) => [...prev, set])
      if (isNewRecord) {
        setNewRecord({ exerciseName: selectedExercise.name })
        setTimeout(() => setNewRecord(null), 3000)
      } else {
        toast.success('Série ajoutée ✓')
      }
      setReps(''); setWeight('')
    } catch { toast.error('Erreur') }
    finally { setAddingSet(false) }
  }

  async function handleDeleteSet(setId: string) {
    try {
      await deleteWorkoutSet(setId)
      setSets((prev) => prev.filter((s) => s.id !== setId))
    } catch { toast.error('Erreur') }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await updateWorkoutSession(id, { completed: true })
      toast.success('Séance terminée ! 🏆', { duration: 3000 })
      setSession((s) => s ? { ...s, completed: true } : s)
    } catch { toast.error('Erreur') }
    finally { setCompleting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  const exercisesUsed = exercises.filter((e) => groupedSets[e.id])
  const exercisesNotUsed = exercises.filter((e) => !groupedSets[e.id])
  const totalVolume = sets.reduce((s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)

  return (
    <div className="animate-fade-in">
      {newRecord && <RecordCelebration exerciseName={newRecord.exerciseName} />}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <ChevronLeft size={18} className="text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-base font-bold truncate max-w-[210px]">{session.name}</h1>
              <p className="text-xs text-text-muted capitalize">{formatDate(session.session_date)}</p>
            </div>
          </div>
          {session.completed ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-accent-green/10 text-accent-green border border-accent-green/20">
              ✓ Terminée
            </span>
          ) : (
            <button onClick={handleComplete} disabled={completing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm text-white active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
              <Check size={15} /> Terminer
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Stats bar */}
        {sets.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Séries', value: sets.length, color: '#a855f7' },
              { label: 'Exercices', value: Object.keys(groupedSets).length, color: '#3b82f6' },
              { label: 'Volume', value: `${Math.round(totalVolume)}kg`, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card py-3 text-center">
                <p className="text-lg font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add set panel */}
        {!session.completed && (
          <div className="card border border-accent-purple/20" style={{ background: 'rgba(168,85,247,0.03)' }}>
            <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <Plus size={15} className="text-accent-purple" /> Ajouter une série
            </p>

            <select
              className="select-field mb-3 text-sm"
              value={selectedExercise?.id ?? ''}
              onChange={(e) => setSelectedExercise(exercises.find((x) => x.id === e.target.value) ?? null)}
            >
              <option value="">— Choisir un exercice —</option>
              {exercisesUsed.length > 0 && (
                <optgroup label="Dans cette séance">
                  {exercisesUsed.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </optgroup>
              )}
              {exercisesNotUsed.length > 0 && (
                <optgroup label="Autres">
                  {exercisesNotUsed.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </optgroup>
              )}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label text-xs">Répétitions *</label>
                <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)}
                  className="input-field text-center text-2xl font-black py-3" placeholder="8" />
              </div>
              <div>
                <label className="label text-xs">Poids (kg)</label>
                <input type="number" step="0.5" min="0" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="input-field text-center text-2xl font-black py-3" placeholder="60" />
              </div>
            </div>

            <button onClick={handleAddSet} disabled={addingSet || !selectedExercise}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#a855f7,#6d28d9)' }}>
              {addingSet
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : '+ Valider la série'
              }
            </button>
          </div>
        )}

        {/* Exercise groups */}
        {Object.keys(groupedSets).length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-2">🏋️</p>
            <p className="text-text-secondary text-sm">Aucune série encore — commence !</p>
          </div>
        ) : (
          Object.entries(groupedSets).map(([exerciseId, exSets]) => {
            const hasRecord = exSets.some((s) => s.is_personal_record)
            const maxWeight = Math.max(...exSets.map((s) => s.weight_kg ?? 0))
            const exVolume = Math.round(exSets.reduce((s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0), 0))

            return (
              <div key={exerciseId} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {hasRecord && <Trophy size={13} className="text-accent-yellow" />}
                    <h3 className="font-bold text-text-primary text-sm">{exSets[0].exercise_name}</h3>
                  </div>
                  <Link href={`/training/progress/${exerciseId}`}
                    className="flex items-center gap-1 text-[10px] text-text-muted bg-bg-secondary px-2 py-1 rounded-lg hover:text-accent-green transition-colors">
                    <TrendingUp size={10} /> Courbe
                  </Link>
                </div>

                {/* Sets */}
                <div className="space-y-1.5 mb-3">
                  <div className="grid grid-cols-4 text-[9px] text-text-muted uppercase tracking-wider px-2 mb-1">
                    <span>Série</span><span className="text-center">Reps</span>
                    <span className="text-center">Poids</span><span className="text-center">Vol.</span>
                  </div>
                  {exSets.map((set) => (
                    <div key={set.id}
                      className={`grid grid-cols-4 items-center px-2 py-2.5 rounded-xl ${set.is_personal_record ? 'bg-accent-yellow/8 border border-accent-yellow/20' : 'bg-bg-secondary'}`}
                    >
                      <span className="text-xs font-semibold text-text-muted">
                        {set.is_personal_record ? '🏆' : `#${set.set_number}`}
                      </span>
                      <span className="text-center text-sm font-black text-text-primary">{set.reps ?? '—'}</span>
                      <span className="text-center text-sm font-black text-accent-purple">
                        {set.weight_kg ? `${set.weight_kg}` : '—'}
                      </span>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-text-muted">
                          {set.weight_kg && set.reps ? Math.round(set.weight_kg * set.reps) : '—'}
                        </span>
                        {!session.completed && (
                          <button onClick={() => handleDeleteSet(set.id)} className="text-text-muted hover:text-accent-red transition-colors">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Séries</p>
                    <p className="text-sm font-bold text-text-primary">{exSets.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Max</p>
                    <p className="text-sm font-bold text-accent-purple">{maxWeight}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Volume</p>
                    <p className="text-sm font-bold text-accent-green">{exVolume}kg</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
