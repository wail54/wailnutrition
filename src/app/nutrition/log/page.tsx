'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getFoods, logMeal } from '@/lib/api/nutrition'
import type { Food, MealTime } from '@/lib/supabase/types'
import { calcCaloriesFromQuantity, calcMacroFromQuantity, getMealTimeLabel, getMealTimeIcon } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ChevronLeft, Search, Plus, Trash2, Zap, Check } from 'lucide-react'
import Link from 'next/link'

interface MealItem {
  food: Food
  quantityG: number
}

const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function LogMealPage() {
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [search, setSearch] = useState('')
  const [mealTime, setMealTime] = useState<MealTime>('lunch')
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showFoodPicker, setShowFoodPicker] = useState(false)

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
      // Log each food separately (one row per food in meal_logs)
      await Promise.all(
        mealItems.map((item) =>
          logMeal({ food: item.food, quantityG: item.quantityG, mealTime })
        )
      )
      toast.success(`${mealItems.length} aliment${mealItems.length > 1 ? 's' : ''} enregistré${mealItems.length > 1 ? 's' : ''} ! 🎉`)
      router.push('/nutrition')
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/nutrition" className="p-2 rounded-xl bg-bg-elevated border border-border">
            <ChevronLeft size={18} className="text-text-secondary" />
          </Link>
          <h1 className="text-xl font-bold">Enregistrer un repas</h1>
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
          <span className="text-sm font-medium">Ajouter un aliment</span>
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
