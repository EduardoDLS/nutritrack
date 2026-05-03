'use client'
import { X } from 'lucide-react'
import type { MenuOption } from '@/types'

interface Props {
  option: MenuOption | null
  onClose: () => void
}

export function MealDetailModal({ option, onClose }: Props) {
  if (!option) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl p-5 w-full max-w-[430px] space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-foreground leading-snug">{option.title}</h3>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {option.ingredients?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingredientes</h4>
            <ul className="space-y-1.5">
              {option.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground flex-1">{ing.name}</span>
                  {(ing.quantity || ing.unit) && (
                    <span className="text-muted-foreground text-xs">
                      {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {option.preparation && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preparación</h4>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {option.preparation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
