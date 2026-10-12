export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'other'
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'other'

export interface Food {
  id: string
  name: string
  serving_size_g: number
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fat_per_serving: number
  created_at: string
}

export interface MealLog {
  id: string
  food_id: string | null
  food_name: string
  quantity_g: number
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_time: MealTime
  logged_at: string
  logged_date: string
}

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  exercise_type: ExerciseType
  description: string | null
  created_at: string
}

export interface WorkoutSession {
  id: string
  name: string
  session_date: string
  notes: string | null
  duration_minutes: number | null
  completed: boolean
  created_at: string
}

export interface WorkoutSet {
  id: string
  session_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  notes: string | null
  is_personal_record: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  daily_calorie_goal: number
  daily_protein_goal: number | null
  daily_carbs_goal: number | null
  daily_fat_goal: number | null
  created_at: string
  updated_at: string
}

export interface PersonalRecord {
  exercise_id: string
  exercise_name: string
  record_weight: number
  record_reps: number
  volume: number
  achieved_at: string
}

export interface ActivityLog {
  id: string
  activity_date: string
  has_nutrition: boolean
  has_workout: boolean
  created_at: string
}

// Aggregated types
export interface DailyNutritionSummary {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
}

export interface ExerciseProgress {
  date: string
  weight_kg: number
  reps: number
  volume: number
  is_personal_record: boolean
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      foods: {
        Row: Food
        Insert: Omit<Food, 'id' | 'created_at'>
        Update: Partial<Omit<Food, 'id' | 'created_at'>>
      }
      meal_logs: {
        Row: MealLog
        Insert: Omit<MealLog, 'id'>
        Update: Partial<Omit<MealLog, 'id'>>
      }
      exercises: {
        Row: Exercise
        Insert: Omit<Exercise, 'id' | 'created_at'>
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>
      }
      workout_sessions: {
        Row: WorkoutSession
        Insert: Omit<WorkoutSession, 'id' | 'created_at'>
        Update: Partial<Omit<WorkoutSession, 'id' | 'created_at'>>
      }
      workout_sets: {
        Row: WorkoutSet
        Insert: Omit<WorkoutSet, 'id' | 'created_at'>
        Update: Partial<Omit<WorkoutSet, 'id' | 'created_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'id' | 'created_at'>>
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>
      }
    }
    Views: {
      personal_records: {
        Row: PersonalRecord
      }
    }
  }
}
