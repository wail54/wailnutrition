'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, Dumbbell, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/weight', label: 'Poids', icon: Scale },
]

export function BottomNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="relative border-t border-white/5" style={{ background: 'rgba(18,18,26,0.92)', backdropFilter: 'blur(24px)' }}>
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-1 flex-1 py-1 rounded-2xl transition-all duration-200 active:scale-95"
              >
                <div className={cn(
                  'relative p-2.5 rounded-2xl transition-all duration-200',
                  active ? 'bg-accent-green/20' : 'bg-transparent'
                )}>
                  {active && (
                    <div className="absolute inset-0 rounded-2xl bg-accent-green/20 blur-md" />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.5}
                    className={cn('relative z-10 transition-all duration-200',
                      active ? 'text-accent-green' : 'text-text-muted'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-semibold transition-colors duration-200',
                  active ? 'text-accent-green' : 'text-text-muted'
                )}>
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
