import { createClient } from '@/lib/supabase/server'
import type { MenuOption, WeeklyPlan, MealTime, DayOfWeek } from '@/types'
import { cn } from '@/lib/utils'

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

export default async function MenuPage() {
  const supabase = await createClient()

  const [planRes, optionsRes] = await Promise.all([
    supabase.from('weekly_plans').select('*').eq('is_active', true).maybeSingle(),
    supabase.from('menu_options').select('*'),
  ])

  const plan = planRes.data as WeeklyPlan | null
  const options = (optionsRes.data ?? []) as MenuOption[]
  const todayKey = TODAY_DAY_KEYS[new Date().getDay()]

  function getOption(day: DayOfWeek, meal: MealTime): MenuOption | undefined {
    const num = plan?.plan[day]?.[meal]
    return options.find(o => o.meal_time === meal && o.option_number === num)
  }

  if (!plan) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted-foreground">No hay plan activo.</p>
        <p className="text-sm text-muted-foreground mt-1">Genera tu semana desde el Dashboard.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Menú semanal</h1>
      <p className="text-sm text-muted-foreground -mt-2">
        Semana del {new Date(plan.week_start + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
      </p>

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
                  <div
                    key={day.key}
                    className={cn(
                      'flex flex-col items-center gap-1',
                      isToday && 'opacity-100',
                      !isToday && 'opacity-60'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] font-medium',
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {day.label}
                    </span>
                    <div className={cn(
                      'w-full rounded-xl p-1 text-center',
                      isToday ? 'bg-primary/10' : 'bg-muted/40'
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
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
