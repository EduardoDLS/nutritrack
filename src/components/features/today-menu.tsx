'use client'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { MenuOption, WeeklyPlan, MealTime } from '@/types'
import { cn } from '@/lib/utils'
import { MealDetailModal } from './meal-detail-modal'

const MEAL_LABELS: Record<MealTime, { label: string; time: string }> = {
  desayuno: { label: 'Desayuno', time: '9am' },
  almuerzo: { label: 'Almuerzo', time: '11am' },
  comida: { label: 'Comida', time: '2pm' },
  colacion: { label: 'Colación', time: '5pm' },
  cena: { label: 'Cena', time: '9pm' },
}

const MEAL_ORDER: MealTime[] = ['desayuno', 'almuerzo', 'comida', 'colacion', 'cena']

function getCurrentMealTime(): MealTime {
  const hour = new Date().getHours()
  if (hour < 10) return 'desayuno'
  if (hour < 13) return 'almuerzo'
  if (hour < 17) return 'comida'
  if (hour < 21) return 'colacion'
  return 'cena'
}

interface Props {
  plan: WeeklyPlan | null
  options: MenuOption[]
}

export function TodayMenu({ plan, options }: Props) {
  const [selected, setSelected] = useState<MenuOption | null>(null)
  const currentMeal = getCurrentMealTime()
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const
  const todayKey = days[new Date().getDay()]
  const todayPlan = plan?.plan[todayKey]

  return (
    <>
      <div className="bg-card rounded-3xl p-4 shadow-sm space-y-1">
        <h2 className="text-base font-semibold text-foreground mb-3">Menú de hoy</h2>
        {MEAL_ORDER.map(mealTime => {
          const meta = MEAL_LABELS[mealTime]
          const optionNum = todayPlan?.[mealTime]
          const option = options.find(o => o.meal_time === mealTime && o.option_number === optionNum)
          const isActive = mealTime === currentMeal
          return (
            <button
              key={mealTime}
              onClick={() => option && setSelected(option)}
              disabled={!option}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-left',
                isActive ? 'bg-primary/10' : 'hover:bg-muted/50',
                option ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full min-w-[40px] text-center',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {meta.time}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {option ? option.title : 'Sin plan'}
              </span>
              {option && <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
            </button>
          )
        })}
        {!plan && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Genera tu primer plan semanal
          </p>
        )}
      </div>
      <MealDetailModal option={selected} onClose={() => setSelected(null)} />
    </>
  )
}
