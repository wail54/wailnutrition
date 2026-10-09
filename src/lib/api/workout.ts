import { supabase } from '@/lib/supabase/client'
import type { Exercise, WorkoutSession, WorkoutSet, MuscleGroup, ExerciseType } from '@/lib/supabase/types'
import { getTodayDate } from '@/lib/utils'
import { upsertActivityLog } from './nutrition'

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function getExercises() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Exercise[]
}

export async function createExercise(exercise: {
  name: string
  muscle_group: MuscleGroup
  exercise_type: ExerciseType
  description?: string
}) {
  const { data, error } = await supabase.from('exercises').insert(exercise).select().single()
  if (error) throw error
  return data as Exercise
}

export async function updateExercise(id: string, exercise: Partial<Omit<Exercise, 'id' | 'created_at'>>) {
  const { data, error } = await supabase.from('exercises').update(exercise).eq('id', id).select().single()
  if (error) throw error
  return data as Exercise
}

export async function deleteExercise(id: string) {
  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) throw error
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function getWorkoutSessions(limit = 30) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .order('session_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as WorkoutSession[]
}

export async function getWorkoutSessionsByMonth(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .order('session_date')
  if (error) throw error
  return data as WorkoutSession[]
}

export async function getWorkoutSessionWithSets(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (sessionError) throw sessionError

  const { data: sets, error: setsError } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  if (setsError) throw setsError

  return { session: session as WorkoutSession, sets: sets as WorkoutSet[] }
}

export async function createWorkoutSession(params: {
  name: string
  session_date?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      name: params.name,
      session_date: params.session_date ?? getTodayDate(),
      notes: params.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data as WorkoutSession
}

export async function updateWorkoutSession(id: string, params: Partial<Omit<WorkoutSession, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as WorkoutSession
}

export async function deleteWorkoutSession(id: string) {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) throw error
}

// ─── Workout Sets ─────────────────────────────────────────────────────────────

export async function addWorkoutSet(params: {
  session_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  reps?: number
  weight_kg?: number
  duration_seconds?: number
  notes?: string
}) {
  // Check if this is a personal record
  const isRecord = await checkPersonalRecord(params.exercise_id, params.weight_kg, params.reps)

  const { data, error } = await supabase
    .from('workout_sets')
    .insert({ ...params, is_personal_record: isRecord })
    .select()
    .single()
  if (error) throw error

  // Mark workout activity
  await upsertActivityLog({ has_workout: true })

  return { set: data as WorkoutSet, isNewRecord: isRecord }
}

export async function deleteWorkoutSet(id: string) {
  const { error } = await supabase.from('workout_sets').delete().eq('id', id)
  if (error) throw error
}

// ─── Personal Records ─────────────────────────────────────────────────────────

export async function checkPersonalRecord(
  exerciseId: string,
  weightKg?: number,
  reps?: number
): Promise<boolean> {
  if (!weightKg || !reps) return false

  const newVolume = weightKg * reps

  const { data } = await supabase
    .from('workout_sets')
    .select('weight_kg, reps')
    .eq('exercise_id', exerciseId)
    .not('weight_kg', 'is', null)
    .not('reps', 'is', null)

  if (!data || data.length === 0) return true // First time = record!

  const maxVolume = Math.max(...data.map((s) => (s.weight_kg ?? 0) * (s.reps ?? 0)))
  return newVolume > maxVolume
}

export async function getPersonalRecords() {
  const { data, error } = await supabase.from('personal_records').select('*')
  if (error) throw error
  return data
}

// ─── Exercise Progress ────────────────────────────────────────────────────────

export async function getExerciseProgress(exerciseId: string, limit = 20) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('weight_kg, reps, is_personal_record, created_at')
    .eq('exercise_id', exerciseId)
    .not('weight_kg', 'is', null)
    .not('reps', 'is', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((s) => ({
    date: new Date(s.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    weight_kg: s.weight_kg ?? 0,
    reps: s.reps ?? 0,
    volume: Math.round((s.weight_kg ?? 0) * (s.reps ?? 0)),
    is_personal_record: s.is_personal_record,
  }))
}
