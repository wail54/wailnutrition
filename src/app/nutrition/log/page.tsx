'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getFoods, logMeal, quickAddMeals } from '@/lib/api/nutrition'
import type { Food, MealTime } from '@/lib/supabase/types'
import { calcCaloriesFromQuantity, calcMacroFromQuantity, getMealTimeLabel, getMealTimeIcon, getTodayDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ChevronLeft, Search, Plus, Trash2, Zap, Check, Bolt } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MealItem {
  food: Food
  quantityG: number
}

const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack']

const QUICK_ADD_PLACEHOLDER = `Riz basmati;150;195;4;42;0.5
Oeuf dur;100;155;13;1;11
Poulet grillé;200;330;62;0;7.2`

export default function LogMealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Date cible : ?date=yyyy-MM-dd ou aujourd'hui
  const dateParam = searchParams.get('date')
  const targetDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : getTodayDate()
  const isToday = targetDate === getTodayDate()
  const displayDate = format(new Date(targetDate + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })

  const [foods, setFoods] = useState<Food[]>([])
  const [search, setSearch] = useState('')
  const [mealTime, setMealTime] = useState<MealTime>('lunch')
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showFoodPicker, setShowFoodPicker] = useState(false)

  // Quick Add state
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickText, setQuickText] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)

  // Quantities per item (indexed)
  const [quantities, setQuantities] = useState<Record<number, string>>({})

  useEffect(() => {
    getFoods().then(setFoods).catch(() => toast.error('Erreur de chargement'))
  }, [])

  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) &&
      !mealItems.some((item) => item.food.id === f.id)
  )

  function addFood(food: Food) {
    setMealItems((prev) => [...prev, { food, quantityG: food.serving_size_g }])
    setQuantities((prev) => ({ ...prev, [mealItems.length]: String(food.serving_size_g) }))
    setShowFoodPicker(false)
    setSearch('')
  }

  function removeItem(index: number) {
    setMealItems((prev) => prev.filter((_, i) => i !== index))
    setQuantities((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  function updateQuantity(index: number, value: string) {
    setQuantities((prev) => ({ ...prev, [index]: value }))
    const qty = parseFloat(value)
    if (!isNaN(qty) && qty > 0) {
      setMealItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, quantityG: qty } : item))
      )
    }
  }

  // Computed totals
  const totals = mealItems.reduce(
    (acc, item) => ({
      calories: acc.calories + calcCaloriesFromQuantity(item.quantityG, item.food),
      protein: acc.protein + calcMacroFromQuantity(item.quantityG, item.food, item.food.protein_per_serving),
      carbs: acc.carbs + calcMacroFromQuantity(item.quantityG, item.food, item.food.carbs_per_serving),
      fat: acc.fat + calcMacroFromQuantity(item.quantityG, item.food, item.food.fat_per_serving),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  async function handleSubmit() {
    if (mealItems.length === 0) {
      toast.error('Ajoute au moins un aliment')
      return
    }
    setLoading(true)
    try {
      await Promise.all(
        mealItems.map((item) =>
          logMeal({ food: item.food, quantityG: item.quantityG, mealTime, date: targetDate })
        )
      )
      toast.success(`${mealItems.length} aliment${mealItems.length > 1 ? 's' : ''} enregistré${mealItems.length > 1 ? 's' : ''} ! 🎉`)
      router.push(`/nutrition${!isToday ? `?date=${targetDate}` : ''}`)
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  async function handleQuickAdd() {
    const lines = quickText.split('\n').filter((l) => l.trim())
    if (lines.length === 0) {
      toast.error('Aucune ligne à traiter')
      return
    }
    setQuickLoading(true)
    try {
      const { added, errors } = await quickAddMeals({ lines, mealTime, date: targetDate })
      if (added > 0) {
        toast.success(`${added} aliment${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''} avec succès ! 🎉`)
        setQuickText('')
        setShowQuickAdd(false)
        router.push(`/nutrition${!isToday ? `?date=${targetDate}` : ''}`)
      }
      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e, { duration: 5000 }))
      }
    } catch (e) {
      toast.error('Erreur lors de la saisie rapide')
      console.error(e)
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href={`/nutrition${!isToday ? `?date=${targetDate}` : ''}`} className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Enregistrer un repas</h1>
            <p className={`text-xs mt-0.5 capitalize ${isToday ? 'text-accent-green' : 'text-accent-orange'}`}>
              {isToday ? "Aujourd'hui" : `📅 Rattrapage — ${displayDate}`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Meal time selector */}
        <div>
          <label className="label">Moment du repas</label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TIMES.map((mt) => (
              <button
                key={mt}
                type="button"
                onClick={() => setMealTime(mt)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                  mealTime === mt
                    ? 'bg-accent-green/10 border-accent-green/50 text-accent-green'
                    : 'bg-bg-secondary border-border text-text-muted'
                }`}
              >
                <span className="text-xl">{getMealTimeIcon(mt)}</span>
                <span className="text-[10px] font-medium leading-tight text-center">
                  {getMealTimeLabel(mt)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick Add toggle ───────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setShowQuickAdd((v) => !v)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
            showQuickAdd
              ? 'bg-accent-purple/10 border-accent-purple/50 text-accent-purple'
              : 'border-dashed border-border text-text-muted hover:border-accent-purple/50 hover:text-accent-purple'
          }`}
        >
          <Bolt size={16} />
          Saisie rapide (coller plusieurs aliments)
        </button>

        {/* ── Quick Add panel ────────────────────────────────────────── */}
        {showQuickAdd && (
          <div className="card border-accent-purple/20 bg-accent-purple/5 animate-slide-up space-y-3">
            <div className="flex items-center gap-2">
              <Bolt size={15} className="text-accent-purple" />
              <span className="text-sm font-semibold text-accent-purple">Saisie rapide</span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Une ligne par aliment, séparée par des <span className="text-text-secondary font-mono">;</span> :<br />
              <span className="text-text-secondary font-mono">Nom ; Quantité(g) ; Kcal ; Prot ; Glucides ; Lipides</span>
            </p>

            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder={QUICK_ADD_PLACEHOLDER}
              rows={5}
              className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 font-mono resize-none focus:outline-none focus:border-accent-purple/60"
              spellCheck={false}
            />

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={quickLoading || !quickText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}
            >
              {quickLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={16} />
                  Ajouter rapidement
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Séparateur ou / ───────────────────────────────────────── */}
        {showQuickAdd && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">ou sélectionne depuis la liste</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Added foods list */}
        {mealItems.length > 0 && (
          <div className="space-y-2">
            <p className="section-title">Aliments sélectionnés ({mealItems.length})</p>
            {mealItems.map((item, index) => {
              const qty = parseFloat(quantities[index] ?? String(item.quantityG))
              const kcal = isNaN(qty) ? 0 : calcCaloriesFromQuantity(qty, item.food)
              return (
                <div key={`${item.food.id}-${index}`} className="card animate-slide-up">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm truncate">{item.food.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.food.calories_per_serving} kcal / {item.food.serving_size_g}g
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-text-muted hover:text-accent-red transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    {/* Quantity input */}
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-text-muted whitespace-nowrap">Quantité (g)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantities[index] ?? item.quantityG}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                        className="input-field text-center font-bold w-24 py-2 text-sm"
                      />
                    </div>
                    {/* Live kcal */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-accent-green">{kcal}</p>
                      <p className="text-[10px] text-text-muted">kcal</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add food button */}
        <button
          type="button"
          onClick={() => setShowFoodPicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-accent-green/50 text-text-muted hover:text-accent-green transition-all"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Ajouter un aliment depuis la liste</span>
        </button>

        {/* Food picker modal */}
        {showFoodPicker && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowFoodPicker(false)}>
            <div
              className="w-full max-w-md mx-auto bg-bg-card rounded-t-3xl p-4 pb-8 animate-slide-up border-t border-border"
              style={{ maxHeight: '70vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
              <h3 className="font-semibold text-text-primary mb-3">Choisir un aliment</h3>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9"
                  autoFocus
                />
              </div>

              {/* Food list */}
              <div className="space-y-1">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-text-muted text-sm">
                      {foods.length === 0 ? 'Aucun aliment.' : 'Aucun résultat.'}
                    </p>
                    <Link
                      href="/nutrition/foods"
                      className="text-accent-green text-sm mt-1 inline-block"
                    >
                      + Ajouter un aliment
                    </Link>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => addFood(food)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-bg-elevated transition-all text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{food.name}</p>
                        <p className="text-xs text-text-muted">
                          {food.calories_per_serving} kcal / {food.serving_size_g}g
                          {' · '}P:{food.protein_per_serving}g G:{food.carbs_per_serving}g L:{food.fat_per_serving}g
                        </p>
                      </div>
                      <Plus size={16} className="text-accent-green shrink-0 ml-2" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Totals preview */}
        {mealItems.length > 0 && (
          <div className="card bg-accent-green/5 border-accent-green/20 animate-scale-up">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={15} className="text-accent-green" />
              <span className="text-sm font-semibold text-accent-green">Total du repas</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xl font-black text-accent-green">{Math.round(totals.calories)}</p>
                <p className="text-[10px] text-text-muted">kcal</p>
              </div>
              <div>
                <p className="text-xl font-black text-accent-blue">{totals.protein.toFixed(1)}g</p>
                <p className="text-[10px] text-text-muted">Prot.</p>
              </div>
              <div>
                <p className="text-xl font-black text-accent-yellow">{totals.carbs.toFixed(1)}g</p>
                <p className="text-[10px] text-text-muted">Gluc.</p>
              </div>
              <div>
                <p className="text-xl font-black text-accent-orange">{totals.fat.toFixed(1)}g</p>
                <p className="text-[10px] text-text-muted">Lip.</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || mealItems.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check size={18} />
              Enregistrer {mealItems.length > 0 ? `(${mealItems.length} aliment${mealItems.length > 1 ? 's' : ''})` : ''}
            </>
          )}
        </button>

      </div>
    </div>
  )
}
