'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, ShoppingCart, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menú' },
  { href: '/shopping', icon: ShoppingCart, label: 'Super' },
  { href: '/progress', icon: TrendingUp, label: 'Progreso' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-5 max-w-[430px] mx-auto">
      <nav className="flex justify-around items-center w-full h-14 bg-card/90 backdrop-blur-md rounded-2xl shadow-lg border border-border/50 px-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              style={{ touchAction: 'manipulation' }}
            className={cn(
                'flex flex-col items-center justify-center w-11 h-10 rounded-xl transition-all duration-200',
                active
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('size-5', active && 'stroke-[2.5px]')} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
