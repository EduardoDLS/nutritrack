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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-card border-t border-border max-w-[430px] mx-auto">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              'flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('size-5', active && 'stroke-[2.5px]')} />
          </Link>
        )
      })}
    </nav>
  )
}
