'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Dumbbell, Calendar, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/training/calendar', label: 'Calendrier', icon: Calendar },
  { href: '/training/exercises', label: 'Exercices', icon: BookOpen },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="bg-bg-secondary/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]',
                  isActive
                    ? 'text-accent-green'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-accent-green/10 glow-green'
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
