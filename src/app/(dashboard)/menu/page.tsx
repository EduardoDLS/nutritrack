import { createClient } from '@/lib/supabase/server'
import type { MenuOption, WeeklyPlan } from '@/types'
import { MenuWeekClient } from '@/components/features/menu-week-client'

export default async function MenuPage() {
  const supabase = await createClient()

  const [planRes, optionsRes] = await Promise.all([
    supabase.from('weekly_plans').select('*').eq('is_active', true).maybeSingle(),
    supabase.from('menu_options').select('*'),
  ])

  const plan = planRes.data as WeeklyPlan | null
  const options = (optionsRes.data ?? []) as MenuOption[]

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
      <MenuWeekClient plan={plan} options={options} />
    </div>
  )
}
