'use client'

import { useEffect, useState } from 'react'
import { getExerciseProgress } from '@/lib/api/workout'
import { getExercises } from '@/lib/api/workout'
import type { Exercise } from '@/lib/supabase/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts'
import { ChevronLeft, TrendingUp, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getMuscleGroupLabel } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default function ExerciseProgressPage({ params }: PageProps) {
  const { id } = params
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'weight' | 'reps' | 'volume'>('weight')

  useEffect(() => {
    async function load() {
      try {
        const [exercises, prog] = await Promise.all([
          getExercises(),
          getExerciseProgress(id, 30),
        ])
        setExercise(exercises.find((e) => e.id === id) ?? null)
        setProgress(prog)
      } catch {
        toast.error('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const maxWeight = progress.length > 0 ? Math.max(...progress.map((p) => p.weight_kg)) : 0
  const maxReps = progress.length > 0 ? Math.max(...progress.map((p) => p.reps)) : 0
  const maxVolume = progress.length > 0 ? Math.max(...progress.map((p) => p.volume)) : 0
  const records = progress.filter((p) => p.is_personal_record)

  const views = [
    { key: 'weight', label: 'Poids', unit: 'kg', color: '#a855f7' },
    { key: 'reps', label: 'Reps', unit: 'reps', color: '#22c55e' },
    { key: 'volume', label: 'Volume', unit: 'kg', color: '#3b82f6' },
  ] as const

  const activeView = views.find((v) => v.key === view)!

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/training/exercises" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">{exercise?.name ?? 'Exercice'}</h1>
            {exercise && (
              <p className="text-xs text-text-muted">{getMuscleGroupLabel(exercise.muscle_group)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* PRs summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-purple">{maxWeight}<span className="text-xs font-normal ml-0.5">kg</span></p>
            <p className="text-[10px] text-text-muted mt-1">Record poids</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-green">{maxReps}<span className="text-xs font-normal ml-0.5">reps</span></p>
            <p className="text-[10px] text-text-muted mt-1">Record reps</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-accent-blue">{maxVolume}<span className="text-xs font-normal ml-0.5">kg</span></p>
            <p className="text-[10px] text-text-muted mt-1">Volume max</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent-purple" />
              <h3 className="font-semibold text-text-primary">Progression</h3>
            </div>
            {/* View toggle */}
            <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
              {views.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    view === v.key ? 'bg-bg-elevated text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {progress.length < 2 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📈</p>
              <p className="text-text-secondary text-sm">
                {progress.length === 0
                  ? 'Aucune donnée encore. Fais des séances !'
                  : 'Encore quelques séances pour voir ta courbe...'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progress} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#2a2a40" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8888aa', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8888aa', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a27',
                    border: '1px solid #2a2a40',
                    borderRadius: '10px',
                    color: '#f0f0f5',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} ${activeView.unit}`, activeView.label]}
                />
                <Line
                  type="monotone"
                  dataKey={view}
                  stroke={activeView.color}
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (payload.is_personal_record) {
                      return (
                        <g key={`dot-${cx}-${cy}`}>
                          <circle cx={cx} cy={cy} r={6} fill="#eab308" stroke="#eab308" strokeWidth={2} />
                          <text x={cx} y={cy - 12} textAnchor="middle" fontSize={12}>🏆</text>
                        </g>
                      )
                    }
                    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={activeView.color} />
                  }}
                  activeDot={{ r: 6, fill: activeView.color, stroke: '#1a1a27', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Record history */}
        {records.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-accent-yellow" />
              <h3 className="font-semibold text-text-primary">Records personnels</h3>
            </div>
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{r.weight_kg}kg × {r.reps} reps</p>
                      <p className="text-xs text-text-muted">{r.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent-yellow">Vol: {r.volume}kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All sets history */}
        {progress.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">Historique complet</h3>
            <div className="space-y-1.5">
              {[...progress].reverse().map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-text-muted">{p.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-primary">{p.weight_kg}kg × {p.reps}</span>
                    {p.is_personal_record && <span className="text-sm">🏆</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
