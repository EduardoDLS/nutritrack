'use client'
import { useState } from 'react'
import type { MenuOption, WeeklyPlan, MealTime, DayOfWeek } from '@/types'
import { cn } from '@/lib/utils'
import { MealDetailModal } from './meal-detail-modal'

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'lunes', label: 'Lun' },
  { key: 'martes', label: 'Mar' },
  { key: 'miercoles', label: 'Mié' },
  { key: 'jueves', label: 'Jue' },
  { key: 'viernes', label: 'Vie' },
  { key: 'sabado', label: 'Sáb' },
  { key: 'domingo', label: 'Dom' },
]

const MEALS: { key: MealTime; label: string; time: string }[] = [
  { key: 'desayuno', label: 'Desayuno', time: '9am' },
  { key: 'almuerzo', label: 'Almuerzo', time: '11am' },
  { key: 'comida', label: 'Comida', time: '2pm' },
  { key: 'colacion', label: 'Colación', time: '5pm' },
  { key: 'cena', label: 'Cena', time: '9pm' },
]

const TODAY_DAY_KEYS: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

interface Props {
  plan: WeeklyPlan
  options: MenuOption[]
}

export function MenuWeekClient({ plan, options }: Props) {
  const [selected, setSelected] = useState<MenuOption | null>(null)
  const todayKey = TODAY_DAY_KEYS[new Date().getDay()]

  function getOption(day: DayOfWeek, meal: MealTime): MenuOption | undefined {
    const num = plan.plan[day]?.[meal]
    return options.find(o => o.meal_time === meal && o.option_number === num)
  }

  return (
    <>
      <div className="space-y-3">
        {MEALS.map(meal => (
          <div key={meal.key} className="bg-card rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {meal.time}
              </span>
              <h2 className="text-sm font-semibold text-foreground">{meal.label}</h2>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(day => {
                const option = getOption(day.key, meal.key)
                const isToday = day.key === todayKey
                return (
                  <button
                    key={day.key}
                    onClick={() => option && setSelected(option)}
                    disabled={!option}
                    className={cn(
                      'flex flex-col items-center gap-1',
                      isToday ? 'opacity-100' : 'opacity-60',
                      option ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] font-medium',
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {day.label}
                    </span>
                    <div className={cn(
                      'w-full rounded-xl p-1 text-center transition-colors',
                      isToday ? 'bg-primary/10' : 'bg-muted/40',
                      option && 'active:scale-95'
                    )}>
                      <span className={cn(
                        'text-[11px] font-bold leading-none',
                        isToday ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {option ? `Op ${option.option_number}` : '—'}
                      </span>
                    </div>
                    {option && (
                      <p className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 w-full">
                        {option.title}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <MealDetailModal option={selected} onClose={() => setSelected(null)} />
    </>
  )
}
