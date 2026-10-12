'use client'

import { useEffect, useState } from 'react'
import { getFoods, createFood, updateFood, deleteFood } from '@/lib/api/nutrition'
import type { Food } from '@/lib/supabase/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronLeft, X, Check } from 'lucide-react'
import Link from 'next/link'

interface FoodForm {
  name: string
  serving_size_g: number
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fat_per_serving: number
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FoodForm>({
    defaultValues: { serving_size_g: 100, protein_per_serving: 0, carbs_per_serving: 0, fat_per_serving: 0 },
  })

  async function load() {
    try {
      const data = await getFoods()
      setFoods(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(food: Food) {
    setEditingFood(food)
    setValue('name', food.name)
    setValue('serving_size_g', food.serving_size_g)
    setValue('calories_per_serving', food.calories_per_serving)
    setValue('protein_per_serving', food.protein_per_serving)
    setValue('carbs_per_serving', food.carbs_per_serving)
    setValue('fat_per_serving', food.fat_per_serving)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingFood(null)
    reset()
  }

  async function onSubmit(data: FoodForm) {
    setSubmitting(true)
    try {
      if (editingFood) {
        await updateFood(editingFood.id, data)
        toast.success('Aliment modifié ✓')
      } else {
        await createFood(data)
        toast.success('Aliment ajouté ✓')
      }
      cancelForm()
      load()
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet aliment ?')) return
    try {
      await deleteFood(id)
      toast.success('Aliment supprimé')
      load()
    } catch {
      toast.error('Impossible de supprimer')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/nutrition" className="p-2 rounded-xl bg-bg-elevated border border-border">
              <ChevronLeft size={18} className="text-text-secondary" />
            </Link>
            <h1 className="text-xl font-bold">Aliments</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-accent-green text-bg-primary px-3 py-2 rounded-xl font-medium text-sm"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mx-4 my-4 card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingFood ? 'Modifier l\'aliment' : 'Nouvel aliment'}</h2>
            <button onClick={cancelForm} className="p-1.5 text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="label">Nom de l'aliment *</label>
              <input
                {...register('name', { required: true })}
                className="input-field"
                placeholder="Ex: Pâtes complètes (cuites)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Portion (g) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('serving_size_g', { required: true, min: 0.1 })}
                  className="input-field"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="label">Calories *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('calories_per_serving', { required: true, min: 0 })}
                  className="input-field"
                  placeholder="200"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Protéines (g)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('protein_per_serving', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Glucides (g)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('carbs_per_serving', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Lipides (g)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('fat_per_serving', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Check size={16} /> {editingFood ? 'Enregistrer' : 'Ajouter l\'aliment'}</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Foods list */}
      <div className="px-4 py-4 space-y-2">
        <p className="section-title">{foods.length} aliment{foods.length !== 1 ? 's' : ''} configuré{foods.length !== 1 ? 's' : ''}</p>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-2">🥗</p>
            <p className="text-text-secondary">Aucun aliment configuré</p>
          </div>
        ) : (
          foods.map((food) => (
            <div
              key={food.id}
              className="card flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{food.name}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-accent-green font-medium">{food.calories_per_serving} kcal</span>
                  <span className="text-xs text-text-muted">/{food.serving_size_g}g</span>
                  {food.protein_per_serving > 0 && (
                    <span className="text-xs text-accent-blue">P: {food.protein_per_serving}g</span>
                  )}
                  {food.carbs_per_serving > 0 && (
                    <span className="text-xs text-accent-yellow">G: {food.carbs_per_serving}g</span>
                  )}
                  {food.fat_per_serving > 0 && (
                    <span className="text-xs text-accent-orange">L: {food.fat_per_serving}g</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(food)}
                  className="p-2 text-text-muted hover:text-accent-blue transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(food.id)}
                  className="p-2 text-text-muted hover:text-accent-red transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
