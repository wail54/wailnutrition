'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getTodayDate } from '@/lib/utils'
import { format, subDays, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingDown, TrendingUp, Minus, Plus, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type WeightLog = { id: string; weight_kg: number; logged_date: string; notes: string | null }
type Period = '7j' | '1m' | 'tout'

const PERIOD_LABELS: Record<Period, string> = { '7j': '7 jours', '1m': '1 mois', 'tout': 'Tout' }

export default function WeightPage() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('1m')
  const [inputWeight, setInputWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('logged_date', { ascending: true })
    if (error) { toast.error('Erreur de chargement'); return }
    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  async function handleSave() {
    const w = parseFloat(inputWeight)
    if (!w || w < 20 || w > 400) { toast.error('Poids invalide'); return }
    setSaving(true)
    try {
      const today = getTodayDate()
      // Upsert: one entry per day
      const { error } = await supabase
        .from('weight_logs')
        .upsert({ weight_kg: w, logged_date: today, notes: null }, { onConflict: 'logged_date' })
      if (error) throw error
      toast.success('Poids enregistré ✓')
      setInputWeight('')
      setShowForm(false)
      fetchLogs()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    await supabase.from('weight_logs').delete().eq('id', id)
    toast.success('Supprimé')
    fetchLogs()
  }

  // Filter logs by period
  const filteredLogs = useMemo(() => {
    if (!logs.length) return []
    const now = new Date()
    const cutoff =
      period === '7j' ? subDays(now, 7) :
      period === '1m' ? subMonths(now, 1) :
      new Date(0)
    return logs.filter((l) => parseISO(l.logged_date) >= cutoff)
  }, [logs, period])

  // Stats
  const currentWeight = logs.at(-1)?.weight_kg ?? null
  const startWeight = logs.at(0)?.weight_kg ?? null
  const totalDiff = currentWeight && startWeight ? +(currentWeight - startWeight).toFixed(1) : null
  const weekLogs = logs.filter((l) => parseISO(l.logged_date) >= subDays(new Date(), 7))
  const weekDiff = weekLogs.length >= 2 ? +(weekLogs.at(-1)!.weight_kg - weekLogs[0].weight_kg).toFixed(1) : null
  const monthLogs = logs.filter((l) => parseISO(l.logged_date) >= subMonths(new Date(), 1))
  const monthDiff = monthLogs.length >= 2 ? +(monthLogs.at(-1)!.weight_kg - monthLogs[0].weight_kg).toFixed(1) : null

  const chartData = filteredLogs.map((l) => ({
    date: format(parseISO(l.logged_date), 'd MMM', { locale: fr }),
    poids: l.weight_kg,
  }))

  const yDomain = chartData.length
    ? [Math.floor(Math.min(...chartData.map((d) => d.poids)) - 1),
       Math.ceil(Math.max(...chartData.map((d) => d.poids)) + 1)]
    : [50, 100]

  function DiffBadge({ diff }: { diff: number | null }) {
    if (diff === null) return <span className="text-text-muted text-xs">—</span>
    const isLoss = diff < 0
    const isNeutral = diff === 0
    return (
      <span className={`flex items-center gap-0.5 font-bold text-sm ${isLoss ? 'text-accent-green' : isNeutral ? 'text-text-muted' : 'text-accent-red'}`}>
        {isLoss ? <TrendingDown size={14} /> : isNeutral ? <Minus size={14} /> : <TrendingUp size={14} />}
        {diff > 0 ? '+' : ''}{diff} kg
      </span>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-bg-elevated border border-border rounded-xl px-3 py-2">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-black text-accent-blue">{payload[0].value} <span className="text-xs font-normal">kg</span></p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-5">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-primary">Poids</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {logs.length > 0 ? `${logs.length} mesure${logs.length > 1 ? 's' : ''} enregistrée${logs.length > 1 ? 's' : ''}` : 'Aucune mesure'}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 20px rgba(59,130,246,0.35)' }}
          >
            <Plus size={16} /> Peser
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">

        {/* Log form */}
        {showForm && (
          <div className="card animate-slide-up border border-accent-blue/20" style={{ background: 'rgba(59,130,246,0.03)' }}>
            <p className="text-sm font-bold text-text-primary mb-3">
              📅 {format(new Date(), 'EEEE d MMMM', { locale: fr })}
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="400"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="75.5"
                  className="input-field text-center text-3xl font-black py-4 pr-12"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">kg</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !inputWeight}
                className="p-4 rounded-xl text-white font-bold active:scale-95 transition-transform disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
              >
                {saving
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check size={20} />}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-32 bg-bg-card animate-pulse rounded-2xl" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-6xl mb-4">⚖️</p>
            <p className="text-text-secondary font-medium">Aucune mesure encore</p>
            <p className="text-text-muted text-sm mt-1">Enregistre ton poids pour suivre ta progression</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
            >
              + Première mesure
            </button>
          </div>
        ) : (
          <>
            {/* Current weight hero */}
            <div className="card relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ background: '#3b82f6' }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Poids actuel</p>
                  <p className="text-5xl font-black text-text-primary mt-1">
                    {currentWeight}
                    <span className="text-xl text-text-muted font-normal ml-1">kg</span>
                  </p>
                  {startWeight && startWeight !== currentWeight && (
                    <p className="text-xs text-text-muted mt-1">
                      Départ : {startWeight} kg
                    </p>
                  )}
                </div>
                {totalDiff !== null && (
                  <div className="text-center bg-bg-secondary rounded-2xl p-4">
                    <p className="text-xs text-text-muted mb-1">Total</p>
                    <DiffBadge diff={totalDiff} />
                    <p className="text-[10px] text-text-muted mt-1">depuis le début</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card">
                <p className="text-xs text-text-muted mb-1">Cette semaine</p>
                <DiffBadge diff={weekDiff} />
                <p className="text-[10px] text-text-muted mt-1">{weekLogs.length} mesure{weekLogs.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="card">
                <p className="text-xs text-text-muted mb-1">Ce mois</p>
                <DiffBadge diff={monthDiff} />
                <p className="text-[10px] text-text-muted mt-1">{monthLogs.length} mesure{monthLogs.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex gap-2">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    period === p
                      ? 'text-white'
                      : 'bg-bg-secondary text-text-muted'
                  }`}
                  style={period === p ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' } : {}}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="card">
              {chartData.length < 2 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm">Ajoute au moins 2 mesures pour voir la courbe</p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingDown size={16} className="text-accent-blue" />
                    Évolution du poids
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#8888aa', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={yDomain}
                        tick={{ fill: '#8888aa', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}kg`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="poids"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            {/* History */}
            <div>
              <p className="section-title">Historique</p>
              <div className="space-y-2">
                {[...logs].reverse().slice(0, 20).map((log, i, arr) => {
                  const prev = arr[i + 1]
                  const diff = prev ? +(log.weight_kg - prev.weight_kg).toFixed(1) : null
                  return (
                    <div key={log.id} className="flex items-center gap-3 card py-3">
                      <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-lg">⚖️</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-primary">{log.weight_kg} kg</p>
                        <p className="text-xs text-text-muted capitalize">
                          {format(parseISO(log.logged_date), 'EEEE d MMMM', { locale: fr })}
                        </p>
                      </div>
                      {diff !== null && <DiffBadge diff={diff} />}
                      <button onClick={() => handleDelete(log.id)} className="p-1.5 text-text-muted hover:text-accent-red transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
