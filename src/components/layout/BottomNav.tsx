'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Dumbbell, Scale, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home, exact: true },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils, exact: false },
  { href: '/training', label: 'Training', icon: Dumbbell, exact: false, exclude: '/training/exercises' },
  { href: '/weight', label: 'Poids', icon: Scale, exact: false },
  { href: '/training/exercises', label: 'Exercices', icon: BookOpen, exact: false },
]

export function BottomNav() {
  const pathname = usePathname()

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href
    if (item.exclude && pathname.startsWith(item.exclude)) return false
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="relative bg-bg-secondary/90 backdrop-blur-2xl border-t border-white/5">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl min-w-[56px]"
              >
                <div className={cn(
                  'relative p-2 rounded-xl transition-all duration-200',
                  active && 'bg-accent-green/15'
                )}>
                  {active && (
                    <div className="absolute inset-0 rounded-xl blur-sm opacity-50 bg-accent-green/30" />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.5}
                    className={cn('relative z-10 transition-colors', active ? 'text-accent-green' : 'text-text-muted')}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium leading-none transition-colors',
                  active ? 'text-accent-green' : 'text-text-muted'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
