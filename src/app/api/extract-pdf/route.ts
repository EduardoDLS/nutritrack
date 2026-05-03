import { createClient } from '@/lib/supabase/server'
import { openai, MODEL } from '@/lib/openai/client'
import { EXTRACT_PDF_PROMPT } from '@/lib/openai/prompts'
import pdfParse from 'pdf-parse'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('pdf') as File | null
  if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const { text } = await pdfParse(buffer)

  if (!text?.trim()) {
    return Response.json({ error: 'No se pudo leer el PDF. Asegúrate de que no esté escaneado como imagen.' }, { status: 400 })
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: `${EXTRACT_PDF_PROMPT}\n\n${text.slice(0, 10000)}` }],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(completion.choices[0].message.content ?? '{}')
  const saved: { menu?: boolean; mediciones?: boolean } = {}

  // Guardar menú si viene en el PDF — reemplaza el anterior del usuario
  if (result.menu?.length) {
    await supabase.from('menu_options').delete().eq('user_id', user.id)
    const rows = result.menu.map((o: { meal_time: string; option_number: number; title: string; ingredients: unknown[]; preparation?: string }) => ({
      meal_time: o.meal_time,
      option_number: o.option_number,
      title: o.title,
      ingredients: o.ingredients ?? [],
      preparation: o.preparation ?? null,
      user_id: user.id,
    }))
    await supabase.from('menu_options').insert(rows)
    saved.menu = true
  }

  // Guardar mediciones si vienen en el PDF
  if (result.mediciones?.fecha) {
    const clean = Object.fromEntries(
      Object.entries(result.mediciones).map(([k, v]) => [k, v === null ? 0 : v])
    )
    await supabase.from('measurements').insert({ ...clean, user_id: user.id })
    saved.mediciones = true
  }

  if (!saved.menu && !saved.mediciones) {
    return Response.json({ error: 'No se encontraron datos reconocibles en el PDF.' }, { status: 400 })
  }

  return Response.json({ saved })
}
