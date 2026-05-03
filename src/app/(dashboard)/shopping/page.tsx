import { createClient } from '@/lib/supabase/server'
import type { WeeklyPlan, ShoppingList } from '@/types'
import { ShoppingListView } from '@/components/features/shopping-list-view'
import { GenerateShoppingButton } from '@/components/features/generate-shopping-button'

export default async function ShoppingPage() {
  const supabase = await createClient()

  const planRes = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  const plan = planRes.data as WeeklyPlan | null

  let shoppingList: ShoppingList | null = null
  if (plan) {
    const listRes = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('weekly_plan_id', plan.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    shoppingList = listRes.data as ShoppingList | null
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
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-foreground">Lista del super</h1>
      </div>
      {shoppingList ? (
        <ShoppingListView list={shoppingList} />
      ) : (
        <div className="bg-card rounded-3xl p-6 shadow-sm text-center space-y-4">
          <p className="text-muted-foreground text-sm">No tienes lista para esta semana.</p>
          <GenerateShoppingButton planId={plan.id} />
        </div>
      )}
    </div>
  )
}
