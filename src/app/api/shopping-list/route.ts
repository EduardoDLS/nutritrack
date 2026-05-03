import { createClient } from '@/lib/supabase/server'
import { openai, MODEL } from '@/lib/openai/client'
import { buildShoppingListPrompt } from '@/lib/openai/prompts'
import type { MenuOption } from '@/types'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekly_plan_id } = await request.json()
  if (!weekly_plan_id) return Response.json({ error: 'weekly_plan_id requerido' }, { status: 400 })

  const [planRes, optionsRes] = await Promise.all([
    supabase.from('weekly_plans').select('*').eq('id', weekly_plan_id).single(),
    supabase.from('menu_options').select('*').order('meal_time'),
  ])

  if (planRes.error || !planRes.data) {
    return Response.json({ error: 'Plan no encontrado' }, { status: 404 })
  }
  if (optionsRes.error || !optionsRes.data?.length) {
    return Response.json({ error: 'No hay opciones de menú' }, { status: 400 })
  }

  const prompt = buildShoppingListPrompt(optionsRes.data as MenuOption[], planRes.data.plan)

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const { items } = JSON.parse(completion.choices[0].message.content ?? '{}')

  const { data: list, error: insertError } = await supabase
    .from('shopping_lists')
    .insert({ weekly_plan_id, items })
    .select()
    .single()

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })

  return Response.json({ list })
}
