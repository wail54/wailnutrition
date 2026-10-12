'use client'

import { useEffect, useState } from 'react'
import { getExercises, createExercise, updateExercise, deleteExercise } from '@/lib/api/workout'
import type { Exercise, MuscleGroup, ExerciseType } from '@/lib/supabase/types'
import { getMuscleGroupLabel } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronLeft, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'core', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'full_body', 'other'
]

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#ef4444', back: '#3b82f6', shoulders: '#a855f7',
  biceps: '#06b6d4', triceps: '#22c55e', forearms: '#64748b',
  core: '#f97316', quadriceps: '#eab308', hamstrings: '#8b5cf6',
  glutes: '#ec4899', calves: '#14b8a6', full_body: '#f43f5e', other: '#6b7280'
}

interface ExerciseForm {
  name: string
  muscle_group: MuscleGroup
  exercise_type: ExerciseType
  description: string
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEx, setEditingEx] = useState<Exercise | null>(null)
  const [filterGroup, setFilterGroup] = useState<MuscleGroup | 'all'>('all')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExerciseForm>({
    defaultValues: { muscle_group: 'chest', exercise_type: 'strength' },
  })

  async function load() {
    try {
      const data = await getExercises()
      setExercises(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(ex: Exercise) {
    setEditingEx(ex)
    setValue('name', ex.name)
    setValue('muscle_group', ex.muscle_group)
    setValue('exercise_type', ex.exercise_type)
    setValue('description', ex.description ?? '')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingEx(null)
    reset()
  }

  async function onSubmit(data: ExerciseForm) {
    setSubmitting(true)
    try {
      if (editingEx) {
        await updateExercise(editingEx.id, data)
        toast.success('Exercice modifié ✓')
      } else {
        await createExercise(data)
        toast.success('Exercice ajouté ✓')
      }
      cancelForm()
      load()
    } catch {
      toast.error('Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    try {
      await deleteExercise(id)
      toast.success('Exercice supprimé')
      load()
    } catch {
      toast.error('Impossible de supprimer')
    }
  }

  const filtered = filterGroup === 'all'
    ? exercises
    : exercises.filter((e) => e.muscle_group === filterGroup)

  const groupsPresent = [...new Set(exercises.map((e) => e.muscle_group))]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <ChevronLeft size={18} className="text-text-secondary" />
            </Link>
            <h1 className="text-xl font-bold">Exercices</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-accent-blue text-white px-3 py-2 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterGroup('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterGroup === 'all' ? 'bg-accent-blue text-white' : 'bg-bg-secondary text-text-muted'
            }`}
          >
            Tous ({exercises.length})
          </button>
          {groupsPresent.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGroup(g)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterGroup === g ? 'text-white' : 'bg-bg-secondary text-text-muted'
              }`}
              style={filterGroup === g ? { backgroundColor: MUSCLE_COLORS[g] } : {}}
            >
              {getMuscleGroupLabel(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mx-4 my-4 card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingEx ? 'Modifier l\'exercice' : 'Nouvel exercice'}</h2>
            <button onClick={cancelForm} className="p-1.5 text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="label">Nom *</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="Ex: Développé couché" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Groupe musculaire</label>
                <select {...register('muscle_group')} className="select-field">
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>{getMuscleGroupLabel(g)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select {...register('exercise_type')} className="select-field">
                  <option value="strength">Musculation</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Souplesse</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description (optionnel)</label>
              <textarea
                {...register('description')}
                className="input-field resize-none"
                rows={2}
                placeholder="Notes sur l'exercice..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? '...' : editingEx ? 'Enregistrer' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-bg-card animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">🏋️</p>
            <p className="text-text-secondary text-sm">Aucun exercice</p>
          </div>
        ) : (
          filtered.map((ex) => (
            <div key={ex.id} className="card flex items-center gap-3">
              <div
                className="w-2 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: MUSCLE_COLORS[ex.muscle_group] ?? '#6b7280' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{ex.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{getMuscleGroupLabel(ex.muscle_group)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/training/progress/${ex.id}`}
                  className="p-2 text-text-muted hover:text-accent-green transition-colors"
                >
                  <TrendingUp size={14} />
                </Link>
                <button onClick={() => startEdit(ex)} className="p-2 text-text-muted hover:text-accent-blue transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(ex.id)} className="p-2 text-text-muted hover:text-accent-red transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
