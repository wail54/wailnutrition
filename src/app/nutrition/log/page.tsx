'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getFoods, logMeal } from '@/lib/api/nutrition'
import type { Food, MealTime } from '@/lib/supabase/types'
import { calcCaloriesFromQuantity, calcMacroFromQuantity, getMealTimeLabel, getMealTimeIcon } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ChevronLeft, Search, Zap } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  food_id: string
  quantity_g: number
  meal_time: MealTime
}

const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function LogMealPage() {
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      meal_time: 'lunch',
      quantity_g: 100,
    },
  })

  const quantityG = watch('quantity_g')

  useEffect(() => {
    getFoods().then(setFoods).catch(() => toast.error('Erreur de chargement des aliments'))
  }, [])

  useEffect(() => {
    if (selectedFood && quantityG > 0) {
      setPreview({
        calories: calcCaloriesFromQuantity(quantityG, selectedFood),
        protein: calcMacroFromQuantity(quantityG, selectedFood, selectedFood.protein_per_serving),
        carbs: calcMacroFromQuantity(quantityG, selectedFood, selectedFood.carbs_per_serving),
        fat: calcMacroFromQuantity(quantityG, selectedFood, selectedFood.fat_per_serving),
      })
    }
  }, [selectedFood, quantityG])

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  async function onSubmit(data: FormData) {
    if (!selectedFood) {
      toast.error('Sélectionne un aliment')
      return
    }
    setLoading(true)
    try {
      await logMeal({
        food: selectedFood,
        quantityG: Number(data.quantity_g),
        mealTime: data.meal_time,
      })
      toast.success('Repas enregistré ! 🎉')
      router.push('/nutrition')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
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

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-4">
        {/* Meal time selector */}
        <div>
          <label className="label">Moment du repas</label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TIMES.map((mt) => {
              const selected = watch('meal_time') === mt
              return (
                <button
                  key={mt}
                  type="button"
                  onClick={() => setValue('meal_time', mt)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    selected
                      ? 'bg-accent-green/10 border-accent-green/50 text-accent-green'
                      : 'bg-bg-secondary border-border text-text-muted'
                  }`}
                >
                  <span className="text-lg">{getMealTimeIcon(mt)}</span>
                  <span className="text-[10px] font-medium">{getMealTimeLabel(mt).split('-')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Food search */}
        <div>
          <label className="label">Aliment</label>
          <div className="relative mb-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un aliment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 bg-bg-secondary rounded-xl p-2">
            {filteredFoods.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">
                Aucun aliment trouvé.{' '}
                <Link href="/nutrition/foods" className="text-accent-green">Ajouter</Link>
              </p>
            ) : (
              filteredFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    setSelectedFood(food)
                    setValue('food_id', food.id)
                    setSearch(food.name)
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedFood?.id === food.id
                      ? 'bg-accent-green/10 border border-accent-green/30'
                      : 'hover:bg-bg-elevated'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">{food.name}</p>
                    <p className="text-xs text-text-muted">
                      {food.calories_per_serving} kcal / {food.serving_size_g}g
                    </p>
                  </div>
                  {selectedFood?.id === food.id && (
                    <span className="text-accent-green text-sm">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="label">Quantité (g)</label>
          <input
            type="number"
            step="1"
            min="1"
            {...register('quantity_g', { required: true, min: 1 })}
            className="input-field"
            placeholder="100"
          />
        </div>

        {/* Live Preview */}
        {selectedFood && quantityG > 0 && (
          <div className="card bg-accent-green/5 border-accent-green/20 animate-scale-up">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-accent-green" />
              <span className="text-sm font-semibold text-accent-green">Aperçu nutritionnel</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-accent-green">{preview.calories}</p>
                <p className="text-[10px] text-text-muted">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-blue">{preview.protein}g</p>
                <p className="text-[10px] text-text-muted">Prot.</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-yellow">{preview.carbs}g</p>
                <p className="text-[10px] text-text-muted">Gluc.</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-orange">{preview.fat}g</p>
                <p className="text-[10px] text-text-muted">Lip.</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFood}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>✓ Enregistrer le repas</>
          )}
        </button>
      </form>
    </div>
  )
}
