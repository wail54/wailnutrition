'use client'

import { useEffect, useState } from 'react'
import { getDailyNutritionSummary, getStreak, getUserSettings } from '@/lib/api/nutrition'
import { getWorkoutSessions } from '@/lib/api/workout'
import { getTodayDate, formatDateFull, getStreakEmoji, getProgressColor } from '@/lib/utils'
import { CalorieGauge } from '@/components/nutrition/CalorieGauge'
import { MacroRing } from '@/components/nutrition/MacroRing'
import { WeeklyChart } from '@/components/nutrition/WeeklyChart'
import { StreakBadge } from '@/components/shared/StreakBadge'
import Link from 'next/link'
import { Dumbbell, Plus, ChevronRight, Flame } from 'lucide-react'

export default function HomePage() {
  const [summary, setSummary] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
  })
  const [goal, setGoal] = useState(1800)
  const [streak, setStreak] = useState(0)
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, settings, str, sessions] = await Promise.all([
          getDailyNutritionSummary(getTodayDate()),
          getUserSettings(),
          getStreak(),
          getWorkoutSessions(3),
        ])
        setSummary(s)
        setGoal(settings.daily_calorie_goal)
        setStreak(str)
        setRecentSessions(sessions)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = new Date()
  const progressPercent = Math.min((summary.total_calories / goal) * 100, 110)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm capitalize">
              {formatDateFull(today)}
            </p>
            <h1 className="text-xl font-bold text-text-primary">Tableau de bord</h1>
          </div>
          <StreakBadge streak={streak} />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Calorie Gauge */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Calories aujourd'hui</h2>
            <Link href="/nutrition" className="text-accent-green text-sm flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </Link>
          </div>
          <CalorieGauge current={summary.total_calories} goal={goal} loading={loading} />
        </div>

        {/* Macros */}
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4">Macronutriments</h2>
          <MacroRing
            protein={summary.total_protein}
            carbs={summary.total_carbs}
            fat={summary.total_fat}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/nutrition/log" className="card flex flex-col items-center gap-2 py-5 active:scale-95 transition-transform border-accent-green/20 hover:border-accent-green/40">
            <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center glow-green">
              <Plus size={20} className="text-accent-green" />
            </div>
            <span className="text-sm font-medium text-text-primary">Enregistrer repas</span>
          </Link>
          <Link href="/training/new" className="card flex flex-col items-center gap-2 py-5 active:scale-95 transition-transform border-accent-blue/20 hover:border-accent-blue/40">
            <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center glow-blue">
              <Dumbbell size={20} className="text-accent-blue" />
            </div>
            <span className="text-sm font-medium text-text-primary">Nouvelle séance</span>
          </Link>
        </div>

        {/* Weekly Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Bilan de la semaine</h2>
          </div>
          <WeeklyChart calorieGoal={goal} />
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-primary">Séances récentes</h2>
              <Link href="/training" className="text-accent-purple text-sm flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/training/session/${s.id}`}
                  className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl active:scale-98 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                      <Dumbbell size={14} className="text-accent-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted">{s.session_date}</p>
                    </div>
                  </div>
                  {s.completed && (
                    <span className="badge bg-accent-green/10 text-accent-green">✓</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
