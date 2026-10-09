'use client'

import { useEffect, useState } from 'react'
import { getMealLogsByDate, getDailyNutritionSummary, deleteMealLog, getUserSettings } from '@/lib/api/nutrition'
import { getTodayDate, getMealTimeLabel, getMealTimeIcon } from '@/lib/utils'
import { CalorieGauge } from '@/components/nutrition/CalorieGauge'
import { MacroRing } from '@/components/nutrition/MacroRing'
import type { MealLog } from '@/lib/supabase/types'
import Link from 'next/link'
import { Plus, Trash2, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, subDays, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [logs, setLogs] = useState<MealLog[]>([])
  const [summary, setSummary] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 })
  const [goal, setGoal] = useState(1800)
  const [loading, setLoading] = useState(true)

  async function load(date: string) {
    setLoading(true)
    try {
      const [l, s, settings] = await Promise.all([
        getMealLogsByDate(date),
        getDailyNutritionSummary(date),
        getUserSettings(),
      ])
      setLogs(l)
      setSummary(s)
      setGoal(settings.daily_calorie_goal)
    } catch (e) {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(selectedDate) }, [selectedDate])

  async function handleDelete(id: string) {
    try {
      await deleteMealLog(id)
      toast.success('Repas supprimé')
      load(selectedDate)
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const goToPrev = () => setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))
  const goToNext = () => {
    const next = addDays(new Date(selectedDate), 1)
    if (next <= new Date()) setSelectedDate(format(next, 'yyyy-MM-dd'))
  }

  const isToday = selectedDate === getTodayDate()
  const displayDate = format(new Date(selectedDate), 'EEEE d MMMM', { locale: fr })

  // Group logs by meal time
  const grouped = logs.reduce<Record<string, MealLog[]>>((acc, log) => {
    if (!acc[log.meal_time]) acc[log.meal_time] = []
    acc[log.meal_time].push(log)
    return acc
  }, {})

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Nutrition</h1>
          <Link href="/nutrition/foods" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <Settings size={18} className="text-text-secondary" />
          </Link>
        </div>

        {/* Date selector */}
        <div className="flex items-center justify-between mt-3 bg-bg-secondary rounded-xl p-2">
          <button onClick={goToPrev} className="p-2 rounded-lg hover:bg-bg-elevated transition-colors">
            <ChevronLeft size={18} className="text-text-secondary" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary capitalize">{displayDate}</p>
            {isToday && <span className="text-xs text-accent-green">Aujourd'hui</span>}
          </div>
          <button
            onClick={goToNext}
            disabled={isToday}
            className="p-2 rounded-lg hover:bg-bg-elevated transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Gauge */}
        <div className="card">
          <CalorieGauge current={summary.total_calories} goal={goal} loading={loading} />
        </div>

        {/* Macros */}
        <div className="card">
          <MacroRing
            protein={summary.total_protein}
            carbs={summary.total_carbs}
            fat={summary.total_fat}
            loading={loading}
          />
        </div>

        {/* Log button */}
        {isToday && (
          <Link
            href="/nutrition/log"
            className="flex items-center justify-center gap-2 w-full btn-primary"
          >
            <Plus size={18} />
            Enregistrer un repas
          </Link>
        )}

        {/* Meal groups */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 bg-bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-text-secondary">Aucun repas enregistré</p>
            {isToday && (
              <Link href="/nutrition/log" className="text-accent-green text-sm mt-2 inline-block">
                + Ajouter un repas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {mealOrder.filter((m) => grouped[m]).map((mealType) => (
              <div key={mealType} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{getMealTimeIcon(mealType)}</span>
                  <h3 className="font-semibold text-text-primary">{getMealTimeLabel(mealType)}</h3>
                  <span className="ml-auto text-sm text-text-secondary">
                    {grouped[mealType].reduce((s, l) => s + l.calories, 0)} kcal
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[mealType].map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{log.food_name}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-text-muted">{log.quantity_g}g</span>
                          <span className="text-xs text-text-muted">P: {log.protein}g</span>
                          <span className="text-xs text-text-muted">G: {log.carbs}g</span>
                          <span className="text-xs text-text-muted">L: {log.fat}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className="text-sm font-semibold text-accent-green">{log.calories} kcal</span>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-text-muted hover:text-accent-red transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
