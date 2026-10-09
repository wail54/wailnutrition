'use client'

import { useEffect, useState } from 'react'
import { getDailyNutritionSummary, getStreak, getUserSettings } from '@/lib/api/nutrition'
import { getWorkoutSessions } from '@/lib/api/workout'
import { getTodayDate, formatDateFull } from '@/lib/utils'
import { CalorieGauge } from '@/components/nutrition/CalorieGauge'
import { MacroRing } from '@/components/nutrition/MacroRing'
import { WeeklyChart } from '@/components/nutrition/WeeklyChart'
import Link from 'next/link'
import { Dumbbell, Plus, ChevronRight, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function HomePage() {
  const [summary, setSummary] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 })
  const [goal, setGoal] = useState(1800)
  const [streak, setStreak] = useState(0)
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, rawSettings, str, sessions] = await Promise.all([
          getDailyNutritionSummary(getTodayDate()),
          getUserSettings(),
          getStreak(),
          getWorkoutSessions(3),
        ])
        const settings = rawSettings as { daily_calorie_goal: number }
        setSummary(s)
        setGoal(settings.daily_calorie_goal)
        setStreak(str)
        setRecentSessions(sessions)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const today = new Date()
  const remaining = Math.max(goal - summary.total_calories, 0)
  const pct = Math.min((summary.total_calories / goal) * 100, 100)

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />

        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-muted text-sm capitalize">
              {format(today, 'EEEE d MMMM', { locale: fr })}
            </p>
            <h1 className="text-2xl font-black text-text-primary mt-0.5">
              Bonjour, Wail 👋
            </h1>
          </div>

          {/* Streak pill */}
          <div className="flex flex-col items-center bg-bg-card border border-border rounded-2xl px-3 py-2">
            <span className="text-2xl leading-none">
              {streak >= 14 ? '🔥🔥' : streak >= 7 ? '🔥' : streak >= 1 ? '⚡' : '💤'}
            </span>
            <p className="text-xs font-bold text-text-primary mt-0.5">{streak}j</p>
            <p className="text-[9px] text-text-muted">streak</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-6">

        {/* Calorie card — hero */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none"
            style={{ background: pct >= 90 ? '#ef4444' : '#22c55e', transform: 'translate(30%,-30%)' }} />

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text-primary">Calories du jour</h2>
            <Link href="/nutrition" className="text-accent-green text-xs flex items-center gap-1 bg-accent-green/10 px-2.5 py-1.5 rounded-lg">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <CalorieGauge current={summary.total_calories} goal={goal} loading={loading} />
        </div>

        {/* Macros */}
        <div className="card">
          <h2 className="font-bold text-text-primary mb-4">Macronutriments</h2>
          <MacroRing protein={summary.total_protein} carbs={summary.total_carbs} fat={summary.total_fat} loading={loading} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/nutrition/log"
            className="flex items-center gap-3 p-4 rounded-2xl border border-accent-green/20 bg-accent-green/5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-accent-green/15 rounded-xl flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 0 16px rgba(34,197,94,0.25)' }}>
              <Plus size={20} className="text-accent-green" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Repas</p>
              <p className="text-[11px] text-text-muted">Enregistrer</p>
            </div>
          </Link>

          <Link href="/training/new"
            className="flex items-center gap-3 p-4 rounded-2xl border border-accent-purple/20 bg-accent-purple/5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-accent-purple/15 rounded-xl flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 0 16px rgba(168,85,247,0.25)' }}>
              <Dumbbell size={20} className="text-accent-purple" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Séance</p>
              <p className="text-[11px] text-text-muted">Commencer</p>
            </div>
          </Link>
        </div>

        {/* Weekly chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent-blue" />
              <h2 className="font-bold text-text-primary">Cette semaine</h2>
            </div>
            <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded-lg">
              Objectif {goal} kcal/j
            </span>
          </div>
          <WeeklyChart calorieGoal={goal} />
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-text-primary">Séances récentes</h2>
              <Link href="/training" className="text-accent-purple text-xs flex items-center gap-1 bg-accent-purple/10 px-2.5 py-1.5 rounded-lg">
                Voir tout <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <Link key={s.id} href={`/training/session/${s.id}`}
                  className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl active:scale-98 transition-transform"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${s.completed ? 'bg-accent-green/10' : 'bg-accent-purple/10'}`}>
                    {s.completed ? '✅' : '🏋️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                    <p className="text-xs text-text-muted">{s.session_date}</p>
                  </div>
                  <ChevronRight size={14} className="text-text-muted" />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
