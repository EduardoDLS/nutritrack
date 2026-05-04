import type { MenuOption, MealTime, DayOfWeek, WeekPlan } from '@/types'

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

function buildAvailabilityMap(options: MenuOption[]): Partial<Record<MealTime, number[]>> {
  const availability: Partial<Record<MealTime, number[]>> = {}
  for (const option of options) {
    if (!availability[option.meal_time]) availability[option.meal_time] = []
    if (!availability[option.meal_time]!.includes(option.option_number)) {
      availability[option.meal_time]!.push(option.option_number)
    }
  }
  return availability
}

export function buildGeneratePlanPrompt(options: MenuOption[]): string {
  const availability = buildAvailabilityMap(options)

  const availabilityLines = (Object.entries(availability) as [MealTime, number[]][])
    .map(([meal, nums]) => `  ${meal}: opciones disponibles [${nums.sort().join(', ')}]`)
    .join('\n')

  const optionDetails = options
    .map(o => `  ${o.meal_time} opción ${o.option_number}: ${o.title}`)
    .join('\n')

  return `Genera un plan semanal de 7 días (lunes a domingo) asignando opciones de menú.

OPCIONES DISPONIBLES POR TIEMPO DE COMIDA — SOLO PUEDES USAR ESTOS NÚMEROS:
${availabilityLines}

Detalle de cada opción:
${optionDetails}

REGLAS ESTRICTAS:
1. CRÍTICO: Solo asigna números de opción que estén en la lista de disponibles para ese tiempo de comida
2. Si un tiempo de comida solo tiene [1], SIEMPRE asigna 1 — está prohibido asignar 2 cuando no existe
3. Si hay [1, 2], alterna entre días para no repetir la misma opción dos días consecutivos
4. Los 7 días DEBEN tener los 5 tiempos: desayuno, almuerzo, comida, colacion, cena

Responde ÚNICAMENTE con JSON válido sin texto adicional:
{
  "lunes":     { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "martes":    { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "miercoles": { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "jueves":    { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "viernes":   { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "sabado":    { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X },
  "domingo":   { "desayuno": X, "almuerzo": X, "comida": X, "colacion": X, "cena": X }
}`
}

const DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const MEAL_TIMES: MealTime[] = ['desayuno', 'almuerzo', 'comida', 'colacion', 'cena']

export function validatePlan(
  rawPlan: Record<string, Record<string, number>>,
  options: MenuOption[]
): WeekPlan {
  const availability = buildAvailabilityMap(options)
  const plan = {} as WeekPlan
  for (const day of DAYS) {
    plan[day] = {} as WeekPlan[DayOfWeek]
    for (const mealTime of MEAL_TIMES) {
      const assigned = rawPlan[day]?.[mealTime]
      const available = availability[mealTime] ?? [1]
      plan[day][mealTime] = (available.includes(assigned) ? assigned : available[0]) as 1 | 2
    }
  }

  return plan
}

// deterministic enumeration in code — not delegated to GPT to avoid counting errors
export function enumerateIngredients(
  options: MenuOption[],
  plan: WeekPlan
): Record<string, string[]> {
  const byKey = new Map(options.map(o => [`${o.meal_time}:${o.option_number}`, o]))
  const appearances: Record<string, string[]> = {}

  for (const day of DAYS) {
    for (const mealTime of MEAL_TIMES) {
      const optionNumber = plan[day]?.[mealTime]
      if (!optionNumber) continue

      const option = byKey.get(`${mealTime}:${optionNumber}`)
      if (!option) continue

      for (const ingredient of option.ingredients) {
        const key = ingredient.name.trim()
        const qty = ingredient.unit
          ? `${ingredient.quantity} ${ingredient.unit}`.trim()
          : ingredient.quantity.trim()
        if (!appearances[key]) appearances[key] = []
        appearances[key].push(qty)
      }
    }
  }

  return appearances
}

export function buildShoppingListPrompt(appearances: Record<string, string[]>): string {
  const lines = Object.entries(appearances)
    .map(([name, entries]) => `- ${name}: ${entries.join(' | ')} (${entries.length}x en el plan)`)
    .join('\n')

  return `Consolida esta lista de ingredientes para la lista del supermercado semanal.

INGREDIENTES CONTABILIZADOS (nombre: cantidades exactas por aparición en el plan):
${lines}

INSTRUCCIONES — LEE CADA PUNTO CON CUIDADO:

1. CARNES Y PROTEÍNAS ANIMALES (pollo, res, cerdo, pescado, atún, camarón):
   - Cuenta el número de apariciones y expresa como piezas individuales
   - Formato obligatorio: "N piezas (Xg c/u)"
   - Ejemplos: "5 piezas (150g c/u)", "7 piezas (120g c/u)"
   - PROHIBIDO: usar kg totales, "900g", "1.05 kg" — siempre piezas
   - Si las apariciones tienen gramajes distintos, usa el más frecuente y anota "aprox"

2. HUEVO:
   - Expresa en piezas: "6 huevos", "12 huevos"

3. VERDURAS (espinacas, jitomate, cebolla, ajo, chile, calabaza, brócoli, etc.):
   - Suma todos los gramos o piezas del plan
   - INCLUYE TODAS — no omitas ninguna verdura aunque aparezca pocas veces
   - Expresa en presentaciones de Walmart/Aurrera México: "1 bolsa 200g", "3 piezas medianas"

4. FRUTAS (plátano, manzana, naranja, fresa, etc.):
   - Suma y expresa como piezas o gramos según corresponda
   - INCLUYE TODAS — no omitas ninguna fruta

5. LÁCTEOS (leche, yogurt, queso, crema):
   - Suma y expresa en presentaciones comerciales (litros, piezas, gramos)

6. ABARROTES (avena, arroz, frijol, aceite, salsa, tortillas, pan, etc.):
   - Suma y expresa en presentaciones comerciales

7. SUPLEMENTOS:
   - Incluye los que aparezcan en el plan
   - Agrega siempre estos 4 aunque no aparezcan explícitamente: Omega 3, Glicinato de magnesio, Proteína ISO HD, Creatina

CATEGORÍAS válidas para el campo "section": "Carnes", "Verduras", "Frutas", "Lácteos", "Abarrotes", "Suplementos"

Responde ÚNICAMENTE con JSON válido sin texto adicional:
{
  "items": [
    { "name": "Pechuga de pollo", "quantity": "5 piezas (150g c/u)", "unit": "", "section": "Carnes", "checked": false },
    { "name": "Carne molida de res", "quantity": "6 piezas (150g c/u)", "unit": "", "section": "Carnes", "checked": false },
    { "name": "Espinacas", "quantity": "1 bolsa 200g", "unit": "", "section": "Verduras", "checked": false }
  ]
}`
}
