import { supabase } from '@/lib/supabase/client'
import type { Food, MealLog, MealTime } from '@/lib/supabase/types'
import { calcCaloriesFromQuantity, calcMacroFromQuantity, getTodayDate } from '@/lib/utils'

// ─── Foods ────────────────────────────────────────────────────────────────────

export async function getFoods() {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Food[]
}

export async function createFood(food: Omit<Food, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('foods').insert(food).select().single()
  if (error) throw error
  return data as Food
}

export async function updateFood(id: string, food: Partial<Omit<Food, 'id' | 'created_at'>>) {
  const { data, error } = await supabase.from('foods').update(food).eq('id', id).select().single()
  if (error) throw error
  return data as Food
}

export async function deleteFood(id: string) {
  const { error } = await supabase.from('foods').delete().eq('id', id)
  if (error) throw error
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export async function getMealLogsByDate(date: string) {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('logged_date', date)
    .order('logged_at')
  if (error) throw error
  return data as MealLog[]
}

export async function getWeeklyMealLogs(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
    .order('logged_date')
  if (error) throw error
  return data as MealLog[]
}

export async function logMeal(params: {
  food: Food
  quantityG: number
  mealTime: MealTime
}) {
  const { food, quantityG, mealTime } = params
  const calories = calcCaloriesFromQuantity(quantityG, food)
  const protein = calcMacroFromQuantity(quantityG, food, food.protein_per_serving)
  const carbs = calcMacroFromQuantity(quantityG, food, food.carbs_per_serving)
  const fat = calcMacroFromQuantity(quantityG, food, food.fat_per_serving)

  const today = getTodayDate()

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      food_id: food.id,
      food_name: food.name,
      quantity_g: quantityG,
      calories,
      protein,
      carbs,
      fat,
      meal_time: mealTime,
      logged_date: today,
    })
    .select()
    .single()

  if (error) throw error

  // Update activity log
  await upsertActivityLog({ has_nutrition: true })

  return data as MealLog
}

export async function deleteMealLog(id: string) {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id)
  if (error) throw error
}

// ─── Daily Summary ────────────────────────────────────────────────────────────

export async function getDailyNutritionSummary(date: string) {
  const logs = await getMealLogsByDate(date)
  return {
    date,
    total_calories: logs.reduce((s, l) => s + l.calories, 0),
    total_protein: Math.round(logs.reduce((s, l) => s + (l.protein ?? 0), 0) * 10) / 10,
    total_carbs: Math.round(logs.reduce((s, l) => s + (l.carbs ?? 0), 0) * 10) / 10,
    total_fat: Math.round(logs.reduce((s, l) => s + (l.fat ?? 0), 0) * 10) / 10,
    meal_count: logs.length,
  }
}

// ─── User Settings ────────────────────────────────────────────────────────────

export async function getUserSettings(): Promise<{
  id: string
  user_id: string
  daily_calorie_goal: number
  daily_protein_goal: number | null
  daily_carbs_goal: number | null
  daily_fat_goal: number | null
  created_at: string
  updated_at: string
}> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', 'default')
    .single()
  if (error) throw error
  return data as any
}

export async function updateUserSettings(settings: {
  daily_calorie_goal?: number
  daily_protein_goal?: number
  daily_carbs_goal?: number
  daily_fat_goal?: number
}) {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('user_id', 'default')
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Activity Log / Streak ────────────────────────────────────────────────────

export async function upsertActivityLog(params: {
  has_nutrition?: boolean
  has_workout?: boolean
}) {
  const today = getTodayDate()
  const { error } = await supabase.from('activity_log').upsert(
    {
      activity_date: today,
      ...(params.has_nutrition !== undefined && { has_nutrition: params.has_nutrition }),
      ...(params.has_workout !== undefined && { has_workout: params.has_workout }),
    },
    { onConflict: 'activity_date' }
  )
  if (error) throw error
}

export async function getStreak(): Promise<number> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('activity_date, has_nutrition, has_workout')
    .order('activity_date', { ascending: false })
    .limit(60)

  if (error || !data) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const log = data.find((l) => l.activity_date === dateStr)
    if (log && (log.has_nutrition || log.has_workout)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}
