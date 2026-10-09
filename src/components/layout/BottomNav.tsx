'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Dumbbell, Scale, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/weight', label: 'Poids', icon: Scale },
  { href: '/training/exercises', label: 'Exercices', icon: BookOpen },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="relative bg-bg-secondary/80 backdrop-blur-2xl border-t border-white/5">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center justify-around px-1 py-2 pb-safe">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px]',
                  isActive ? 'text-white' : 'text-text-muted'
                )}
              >
                <div className={cn('relative p-2 rounded-xl transition-all duration-200', isActive && 'bg-accent-green/15')}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl blur-sm opacity-60"
                      style={{ background: 'rgba(34,197,94,0.3)' }} />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={cn('relative z-10', isActive ? 'text-accent-green' : 'text-text-muted')}
                  />
                </div>
                <span className={cn('text-[10px] font-medium leading-none transition-all', isActive ? 'text-accent-green' : 'text-text-muted')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
