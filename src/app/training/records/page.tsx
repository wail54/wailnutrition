'use client'

import { useEffect, useState } from 'react'
import { getPersonalRecords } from '@/lib/api/workout'
import { getMuscleGroupLabel } from '@/lib/utils'
import { ChevronLeft, Trophy, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPersonalRecords()
      .then((data) => setRecords(data ?? []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/training" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Records Personnels</h1>
            <p className="text-xs text-text-muted">Tes meilleures performances</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-text-secondary">Aucun record encore.</p>
            <p className="text-text-muted text-sm mt-1">Commence à t'entraîner !</p>
            <Link href="/training/new" className="btn-primary inline-block mt-4 text-sm">
              Créer une séance
            </Link>
          </div>
        ) : (
          <>
            <div className="card bg-accent-yellow/5 border border-accent-yellow/20 text-center py-3">
              <p className="text-accent-yellow font-bold">🏆 {records.length} Record{records.length > 1 ? 's' : ''} Personnel{records.length > 1 ? 's' : ''}</p>
            </div>
            {records.map((record) => (
              <div
                key={record.exercise_id}
                className="card"
                style={{ borderLeft: '3px solid #eab308' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-accent-yellow shrink-0" />
                      <p className="font-semibold text-text-primary truncate">{record.exercise_name}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-center">
                        <p className="text-lg font-black text-accent-purple">{record.record_weight}<span className="text-xs font-normal">kg</span></p>
                        <p className="text-[10px] text-text-muted">Poids</p>
                      </div>
                      <div className="text-text-muted">×</div>
                      <div className="text-center">
                        <p className="text-lg font-black text-accent-green">{record.record_reps}<span className="text-xs font-normal"> reps</span></p>
                        <p className="text-[10px] text-text-muted">Reps</p>
                      </div>
                      <div className="text-text-muted">=</div>
                      <div className="text-center">
                        <p className="text-lg font-black text-accent-blue">{Math.round(record.volume)}<span className="text-xs font-normal">kg</span></p>
                        <p className="text-[10px] text-text-muted">Volume</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/training/progress/${record.exercise_id}`}
                    className="p-2 text-text-muted hover:text-accent-green transition-colors ml-3"
                  >
                    <TrendingUp size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
