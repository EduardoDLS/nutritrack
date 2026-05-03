import { createClient } from '@/lib/supabase/server'
import { openai, MODEL } from '@/lib/openai/client'
import pdfParse from 'pdf-parse'

const EXTRACT_PROMPT = `Eres un asistente que extrae datos de tablas de mediciones corporales de un nutriólogo.

Del siguiente texto de un PDF de seguimiento nutricional, extrae TODOS los valores numéricos que encuentres.
Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (usa null para campos no encontrados, no uses 0):

{
  "fecha": "YYYY-MM-DD",
  "peso": number,
  "imc": number,
  "grasa_pct_bascula": number,
  "grasa_kg": number,
  "musculo_pct": number,
  "musculo_kg": number,
  "agua_pct": number,
  "grasa_visceral": number,
  "masa_osea": number,
  "c_brazo_relajado": number,
  "c_brazo_contraido": number,
  "diferencia_brazo": number,
  "c_pecho": number,
  "c_cintura": number,
  "c_abdominal": number,
  "c_cadera": number,
  "c_gluteo": number,
  "c_cuadricep": number,
  "c_cuadricep_max": number,
  "c_pantorrilla_max": number,
  "p_bicipital": number,
  "p_tricipital": number,
  "p_subescapular": number,
  "p_suprailiaco": number,
  "p_abdominal": number,
  "p_supraespinal": number,
  "p_cuadricep": number,
  "p_pantorrilla": number,
  "masa_muscular_total": number,
  "musculo_pct_formula": number,
  "grasa_4pliegues_pct": number,
  "grasa_4pliegues_kg": number,
  "masa_muscular_lee": number,
  "masa_muscular_lee_pct": number
}

Si hay varias fechas en el PDF, extrae solo la más reciente.
Texto del PDF:`

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
    messages: [{ role: 'user', content: `${EXTRACT_PROMPT}\n\n${text.slice(0, 8000)}` }],
    response_format: { type: 'json_object' },
  })

  const extracted = JSON.parse(completion.choices[0].message.content ?? '{}')

  // Reemplaza null por 0 en campos numéricos
  const clean = Object.fromEntries(
    Object.entries(extracted).map(([k, v]) => [k, v === null ? 0 : v])
  )

  const { data, error } = await supabase
    .from('measurements')
    .insert({ ...clean, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ measurement: data })
}
