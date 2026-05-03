import type { MenuOption } from '@/types'

export const EXTRACT_PDF_PROMPT = `Eres un asistente de nutrición. Analiza el texto de un PDF de un nutriólogo y extrae TODO lo que encuentres.

Devuelve ÚNICAMENTE un JSON válido con esta estructura (omite las secciones que no encuentres en el PDF):

{
  "tipo": "menu" | "mediciones" | "ambos",

  "menu": [
    {
      "meal_time": "desayuno" | "almuerzo" | "comida" | "colacion" | "cena",
      "option_number": 1 | 2,
      "title": "Nombre corto de la opción",
      "preparation": "Instrucciones de preparación tal como aparecen en el PDF, o null si no hay",
      "ingredients": [
        { "name": "nombre", "quantity": "cantidad", "unit": "unidad opcional" }
      ]
    }
  ],

  "mediciones": {
    "fecha": "YYYY-MM-DD",
    "peso": number | null,
    "imc": number | null,
    "grasa_pct_bascula": number | null,
    "grasa_kg": number | null,
    "musculo_pct": number | null,
    "musculo_kg": number | null,
    "agua_pct": number | null,
    "grasa_visceral": number | null,
    "masa_osea": number | null,
    "c_brazo_relajado": number | null,
    "c_brazo_contraido": number | null,
    "diferencia_brazo": number | null,
    "c_pecho": number | null,
    "c_cintura": number | null,
    "c_abdominal": number | null,
    "c_cadera": number | null,
    "c_gluteo": number | null,
    "c_cuadricep": number | null,
    "c_cuadricep_max": number | null,
    "c_pantorrilla_max": number | null,
    "p_bicipital": number | null,
    "p_tricipital": number | null,
    "p_subescapular": number | null,
    "p_suprailiaco": number | null,
    "p_abdominal": number | null,
    "p_supraespinal": number | null,
    "p_cuadricep": number | null,
    "p_pantorrilla": number | null,
    "masa_muscular_total": number | null,
    "musculo_pct_formula": number | null,
    "grasa_4pliegues_pct": number | null,
    "grasa_4pliegues_kg": number | null,
    "masa_muscular_lee": number | null,
    "masa_muscular_lee_pct": number | null
  }
}

Si el PDF tiene varias fechas de medición, extrae solo la más reciente.
Texto del PDF:`

export function buildGeneratePlanPrompt(options: MenuOption[]): string {
  const optionsSummary = options
    .map(o => `${o.meal_time} opción ${o.option_number}: ${o.title}`)
    .join('\n')

  return `Eres un nutriólogo asistente. Genera un plan semanal de 7 días (lunes a domingo) usando las siguientes opciones de menú.

Opciones disponibles:
${optionsSummary}

Reglas:
- No repitas la misma opción en el mismo tiempo de comida dos días consecutivos
- Optimiza para variedad y menor gasto en supermercado (preferir opciones que compartan ingredientes)
- Cada día debe tener los 5 tiempos: desayuno, almuerzo, comida, colacion, cena

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (los 7 días completos):
{
  "lunes":    { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "martes":   { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "miercoles":{ "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "jueves":   { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "viernes":  { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "sabado":   { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 },
  "domingo":  { "desayuno": 1, "almuerzo": 1, "comida": 1, "colacion": 1, "cena": 1 }
}
Sustituye cada número con el número de opción real (1 o 2) según las opciones disponibles para ese tiempo de comida.`
}

export function buildShoppingListPrompt(
  options: MenuOption[],
  plan: Record<string, Record<string, number>>
): string {
  return `Eres un asistente de nutrición. Genera una lista del supermercado consolidada para una semana completa.

Plan de la semana:
${JSON.stringify(plan, null, 2)}

Opciones del menú con ingredientes:
${JSON.stringify(options, null, 2)}

Reglas:
- Consolida ingredientes repetidos sumando cantidades
- Agrupa por sección: Carnes, Verduras, Lácteos, Abarrotes, Suplementos
- CARNES: NO uses peso total en kg. Expresa cada carne como número de piezas individuales indicando los gramos por pieza. Ejemplo: "7 piezas (150g c/u)" en lugar de "1.05 kg". Cuenta exactamente cuántos días del plan requieren esa carne y a qué gramaje.
- El resto de ingredientes: usa presentaciones comerciales reales de Walmart/Aurrera México (ej: "500g", "1 pieza", "1 bolsa de 250g", "1 litro")
- Incluye los suplementos diarios: omega 3, glicinato de magnesio, proteína iso hd, creatina

Responde ÚNICAMENTE con un JSON válido:
{
  "items": [
    { "name": "Pechuga de pollo", "quantity": "5 piezas (150g c/u)", "unit": "", "section": "Carnes", "checked": false },
    { "name": "Bistec de res", "quantity": "3 piezas (150g c/u)", "unit": "", "section": "Carnes", "checked": false },
    ...
  ]
}`
}
