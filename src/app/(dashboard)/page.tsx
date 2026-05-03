import { createClient } from '@/lib/supabase/server'
import { TodayMenu } from '@/components/features/today-menu'
import { ProgressSummary } from '@/components/features/progress-summary'
import { GenerateWeekButton } from '@/components/features/generate-week-button'
import type { MenuOption, WeeklyPlan, Measurement } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, optionsRes, planRes, measurementRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('menu_options').select('*').order('meal_time'),
    supabase.from('weekly_plans').select('*').eq('is_active', true).maybeSingle(),
    supabase.from('measurements').select('*').order('fecha', { ascending: false }).limit(1).maybeSingle(),
  ])

  const options = (optionsRes.data ?? []) as MenuOption[]
  const plan = planRes.data as WeeklyPlan | null
  const latest = measurementRes.data as Measurement | null

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? 'Eduardo'
  const initial = displayName[0].toUpperCase()

  const todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Hola, {displayName}</h1>
          <p className="text-sm text-muted-foreground capitalize">{todayDate}</p>
        </div>
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{initial}</span>
        </div>
      </div>
      <TodayMenu plan={plan} options={options} />
      <ProgressSummary latest={latest} />
      <GenerateWeekButton />
    </div>
  )
}
