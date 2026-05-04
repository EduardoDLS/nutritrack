import { createClient } from '@/lib/supabase/server'
import { openai, MODEL } from '@/lib/openai/client'
import { buildGeneratePlanPrompt, validatePlan, enumerateIngredients, buildShoppingListPrompt } from '@/lib/openai/prompts'
import type { MenuOption } from '@/types'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: options, error } = await supabase
    .from('menu_options')
    .select('*')
    .order('meal_time')

  if (error || !options?.length) {
    return Response.json({ error: 'No hay opciones de menú' }, { status: 400 })
  }

  const planCompletion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: buildGeneratePlanPrompt(options as MenuOption[]) }],
    response_format: { type: 'json_object' },
  })

  const rawPlan = JSON.parse(planCompletion.choices[0].message.content ?? '{}')
  const plan = validatePlan(rawPlan, options as MenuOption[])

  await supabase.from('weekly_plans').update({ is_active: false }).eq('is_active', true)

  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0]

  const { data: newPlan, error: insertError } = await supabase
    .from('weekly_plans')
    .insert({ week_start: weekStart, plan, is_active: true, user_id: user.id })
    .select()
    .single()

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })

  const appearances = enumerateIngredients(options as MenuOption[], plan)

  const listCompletion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: buildShoppingListPrompt(appearances) }],
    response_format: { type: 'json_object' },
  })

  const { items } = JSON.parse(listCompletion.choices[0].message.content ?? '{}')

  await supabase
    .from('shopping_lists')
    .insert({ weekly_plan_id: newPlan.id, items, user_id: user.id })

  return Response.json({ plan: newPlan })
}
