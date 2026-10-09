import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: fr })
}

export function formatDateFull(date: string | Date) {
  return format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getWeekDates(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function calcCaloriesFromQuantity(
  quantityG: number,
  food: { serving_size_g: number; calories_per_serving: number }
): number {
  return Math.round((quantityG / food.serving_size_g) * food.calories_per_serving)
}

export function calcMacroFromQuantity(
  quantityG: number,
  food: { serving_size_g: number },
  macroPer: number
): number {
  return Math.round(((quantityG / food.serving_size_g) * macroPer) * 10) / 10
}

export function calcOneRepMax(weight: number, reps: number): number {
  // Epley formula
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return '#ef4444' // red - over goal
  if (percent >= 80) return '#eab308'  // yellow - getting close
  if (percent >= 50) return '#22c55e'  // green - good
  return '#3b82f6'                      // blue - low
}

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    chest: 'Pectoraux',
    back: 'Dos',
    shoulders: 'Épaules',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearms: 'Avant-bras',
    core: 'Abdos / Core',
    quadriceps: 'Quadriceps',
    hamstrings: 'Ischio-jambiers',
    glutes: 'Fessiers',
    calves: 'Mollets',
    full_body: 'Corps entier',
    other: 'Autre',
  }
  return labels[group] ?? group
}

export function getMealTimeLabel(mealTime: string): string {
  const labels: Record<string, string> = {
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    snack: 'Collation',
  }
  return labels[mealTime] ?? mealTime
}

export function getMealTimeIcon(mealTime: string): string {
  const icons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }
  return icons[mealTime] ?? '🍽️'
}

export function formatWeight(kg: number | null): string {
  if (kg === null) return '—'
  return `${kg} kg`
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🏆'
  if (streak >= 14) return '🔥🔥🔥'
  if (streak >= 7) return '🔥🔥'
  if (streak >= 3) return '🔥'
  if (streak >= 1) return '⚡'
  return '💤'
}
