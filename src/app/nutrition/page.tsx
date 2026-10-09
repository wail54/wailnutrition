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
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(selectedDate) }, [selectedDate])

  async function handleDelete(id: string) {
    try {
      await deleteMealLog(id)
      toast.success('Repas supprimé')
      load(selectedDate)
    } catch { toast.error('Erreur') }
  }

  const goToPrev = () => setSelectedDate(format(subDays(new Date(selectedDate + 'T12:00:00'), 1), 'yyyy-MM-dd'))
  const goToNext = () => {
    const next = addDays(new Date(selectedDate + 'T12:00:00'), 1)
    if (format(next, 'yyyy-MM-dd') <= getTodayDate())
      setSelectedDate(format(next, 'yyyy-MM-dd'))
  }

  const isToday = selectedDate === getTodayDate()
  const displayDate = format(new Date(selectedDate + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })
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
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black">Nutrition</h1>
          <Link href="/nutrition/foods" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <Settings size={18} className="text-text-secondary" />
          </Link>
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-2">
          <button onClick={goToPrev} className="p-2.5 rounded-xl bg-bg-secondary border border-border active:scale-95 transition-transform">
            <ChevronLeft size={16} className="text-text-secondary" />
          </button>
          <div className="flex-1 text-center bg-bg-secondary rounded-xl py-2.5 px-3 border border-border">
            <p className="text-sm font-semibold text-text-primary capitalize">{displayDate}</p>
            {isToday && <p className="text-[10px] text-accent-green font-medium">Aujourd'hui</p>}
          </div>
          <button onClick={goToNext} disabled={isToday}
            className="p-2.5 rounded-xl bg-bg-secondary border border-border active:scale-95 transition-transform disabled:opacity-30">
            <ChevronRight size={16} className="text-text-secondary" />
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
          <MacroRing protein={summary.total_protein} carbs={summary.total_carbs} fat={summary.total_fat} loading={loading} />
        </div>

        {/* Log button */}
        {isToday && (
          <Link href="/nutrition/log"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-bg-primary"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
          >
            <Plus size={18} />
            Enregistrer un repas
          </Link>
        )}

        {/* Meals */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="h-28 bg-bg-card animate-pulse rounded-2xl" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="text-text-secondary font-medium">Aucun repas enregistré</p>
            {isToday && (
              <Link href="/nutrition/log" className="inline-flex items-center gap-1 text-accent-green text-sm mt-3">
                <Plus size={14} /> Ajouter un repas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {mealOrder.filter((m) => grouped[m]).map((mealType) => {
              const mealKcal = grouped[mealType].reduce((s, l) => s + l.calories, 0)
              return (
                <div key={mealType} className="card">
                  {/* Meal header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getMealTimeIcon(mealType)}</span>
                    <div className="flex-1">
                      <p className="font-bold text-text-primary">{getMealTimeLabel(mealType)}</p>
                      <p className="text-xs text-text-muted">{grouped[mealType].length} aliment{grouped[mealType].length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-accent-green">{mealKcal}</p>
                      <p className="text-[10px] text-text-muted">kcal</p>
                    </div>
                  </div>

                  {/* Food items */}
                  <div className="space-y-1.5">
                    {grouped[mealType].map((log) => (
                      <div key={log.id}
                        className="flex items-center gap-3 px-3 py-2.5 bg-bg-secondary rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{log.food_name}</p>
                          <div className="flex gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-text-muted">{log.quantity_g}g</span>
                            {log.protein > 0 && <span className="text-[10px] text-accent-blue">P {log.protein}g</span>}
                            {log.carbs > 0 && <span className="text-[10px] text-accent-yellow">G {log.carbs}g</span>}
                            {log.fat > 0 && <span className="text-[10px] text-accent-orange">L {log.fat}g</span>}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-accent-green shrink-0">{log.calories} kcal</span>
                        <button onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-text-muted hover:text-accent-red transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
