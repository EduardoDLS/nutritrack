'use client'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleShoppingItem } from '@/lib/actions'
import type { ShoppingList, ShoppingItem } from '@/types'

const SECTION_ORDER: ShoppingItem['section'][] = ['Carnes', 'Verduras', 'Frutas', 'Lácteos', 'Abarrotes', 'Suplementos']

const SECTION_COLORS: Record<ShoppingItem['section'], string> = {
  Carnes: 'bg-rose-100 text-rose-600',
  Verduras: 'bg-sky-100 text-sky-600',
  Frutas: 'bg-orange-100 text-orange-600',
  Lácteos: 'bg-blue-100 text-blue-600',
  Abarrotes: 'bg-yellow-100 text-yellow-600',
  Suplementos: 'bg-violet-100 text-violet-600',
}

export function ShoppingListView({ list }: { list: ShoppingList }) {
  const [items, setItems] = useState<ShoppingItem[]>(list.items)
  const [isPending, startTransition] = useTransition()

  const checkedCount = items.filter(i => i.checked).length

  function toggle(index: number) {
    const next = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    )
    setItems(next)
    startTransition(async () => {
      await toggleShoppingItem(list.id, next)
    })
  }

  const grouped = SECTION_ORDER.reduce<Record<string, { item: ShoppingItem; index: number }[]>>(
    (acc, section) => {
      acc[section] = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.section === section)
      return acc
    },
    {} as Record<string, { item: ShoppingItem; index: number }[]>
  )

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-3xl px-4 py-3 shadow-sm flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {checkedCount} de {items.length} ítems
        </span>
        <div className="h-2 flex-1 mx-4 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-medium text-primary">
          {items.length ? Math.round((checkedCount / items.length) * 100) : 0}%
        </span>
      </div>

      {SECTION_ORDER.map(section => {
        const sectionItems = grouped[section]
        if (!sectionItems?.length) return null
        return (
          <div key={section} className="bg-card rounded-3xl p-4 shadow-sm">
            <span className={cn('text-xs font-semibold px-2 py-1 rounded-full inline-block mb-3', SECTION_COLORS[section])}>
              {section}
            </span>
            <ul className="space-y-1">
              {sectionItems.map(({ item, index }) => (
                <li key={index}>
                  <button
                    onClick={() => toggle(index)}
                    disabled={isPending}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-left',
                      item.checked ? 'opacity-50' : 'hover:bg-muted/50'
                    )}
                  >
                    <span className={cn(
                      'size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      item.checked
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30'
                    )}>
                      {item.checked && <Check className="size-3 text-primary-foreground stroke-[3]" />}
                    </span>
                    <span className={cn(
                      'flex-1 text-sm text-foreground',
                      item.checked && 'line-through'
                    )}>
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.quantity} {item.unit}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
