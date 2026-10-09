'use client'

import { useEffect, useState } from 'react'
import { getWorkoutSessionsByMonth } from '@/lib/api/workout'
import type { WorkoutSession } from '@/lib/supabase/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getWorkoutSessionsByMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        )
        setSessions(data)
      } catch {
        toast.error('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Padding for first day of week (Monday-based)
  const firstDayOffset = (getDay(monthStart) + 6) % 7

  function getSessionsForDay(day: Date): WorkoutSession[] {
    const dateStr = format(day, 'yyyy-MM-dd')
    return sessions.filter((s) => s.session_date === dateStr)
  }

  const selectedDaySessions = selectedDay ? getSessionsForDay(selectedDay) : []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <ChevronLeft size={18} className="text-text-secondary" />
            </Link>
            <h1 className="text-xl font-bold">Calendrier</h1>
          </div>
          <Link href="/training/new" className="flex items-center gap-1.5 bg-accent-purple text-white px-3 py-2 rounded-xl text-sm font-medium">
            <Plus size={16} />
            Séance
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="p-2 rounded-xl hover:bg-bg-elevated transition-colors"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </button>
          <h2 className="font-semibold text-text-primary capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="p-2 rounded-xl hover:bg-bg-elevated transition-colors"
          >
            <ChevronRight size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="card p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="text-center text-[11px] text-text-muted font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells */}
            {[...Array(firstDayOffset)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const daySessions = getSessionsForDay(day)
              const hasSession = daySessions.length > 0
              const hasCompleted = daySessions.some((s) => s.completed)
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
              const today = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                  className={`
                    relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all
                    ${isSelected ? 'bg-accent-purple text-white' : today ? 'bg-accent-purple/20 text-accent-purple' : 'hover:bg-bg-elevated text-text-primary'}
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  {hasSession && (
                    <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      hasCompleted ? 'bg-accent-green' : 'bg-accent-orange'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-[10px] text-text-muted">Terminée</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-orange" />
              <span className="text-[10px] text-text-muted">Planifiée</span>
            </div>
          </div>
        </div>

        {/* Selected day sessions */}
        {selectedDay && (
          <div className="animate-slide-up">
            <p className="section-title capitalize">{format(selectedDay, 'EEEE d MMMM', { locale: fr })}</p>
            {selectedDaySessions.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-text-muted text-sm">Aucune séance</p>
                <Link
                  href="/training/new"
                  className="text-accent-purple text-sm mt-2 inline-block"
                >
                  + Créer une séance
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDaySessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/training/session/${session.id}`}
                    className="card flex items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      session.completed ? 'bg-accent-green/10' : 'bg-accent-purple/10'
                    }`}>
                      {session.completed ? (
                        <span className="text-lg">✓</span>
                      ) : (
                        <Dumbbell size={16} className="text-accent-purple" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{session.name}</p>
                      {session.duration_minutes && (
                        <p className="text-xs text-text-muted">⏱ {session.duration_minutes}min</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monthly stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-purple">{sessions.length}</p>
            <p className="text-[10px] text-text-muted mt-1">Séances</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-green">{sessions.filter((s) => s.completed).length}</p>
            <p className="text-[10px] text-text-muted mt-1">Terminées</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-orange">
              {sessions.filter((s) => !s.completed).length}
            </p>
            <p className="text-[10px] text-text-muted mt-1">À faire</p>
          </div>
        </div>
      </div>
    </div>
  )
}
