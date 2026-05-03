import type { MenuOption } from '@/types'

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

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "lunes": { "desayuno": 1, "almuerzo": 2, "comida": 1, "colacion": 2, "cena": 1 },
  "martes": { ... },
  ...
}`
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
