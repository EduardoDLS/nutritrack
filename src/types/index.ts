export type MealTime = 'desayuno' | 'almuerzo' | 'comida' | 'colacion' | 'cena'
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface MenuOption {
  id: string
  meal_time: MealTime
  option_number: 1 | 2
  title: string
  ingredients: Ingredient[]
  preparation?: string
  created_at: string
}

export interface Ingredient {
  name: string
  quantity: string
  unit?: string
}

export type DayPlan = Record<MealTime, 1 | 2>
export type WeekPlan = Record<DayOfWeek, DayPlan>

export interface WeeklyPlan {
  id: string
  week_start: string
  plan: WeekPlan
  generated_at: string
  is_active: boolean
}

export interface ShoppingItem {
  name: string
  quantity: string
  unit: string
  section: 'Carnes' | 'Verduras' | 'Lácteos' | 'Abarrotes' | 'Suplementos'
  checked: boolean
}

export interface ShoppingList {
  id: string
  weekly_plan_id: string
  items: ShoppingItem[]
  created_at: string
}

export interface Measurement {
  id: string
  fecha: string
  peso: number
  imc: number
  grasa_pct_bascula: number
  grasa_kg: number
  musculo_pct: number
  musculo_kg: number
  agua_pct: number
  grasa_visceral: number
  masa_osea: number
  c_brazo_relajado: number
  c_brazo_contraido: number
  diferencia_brazo: number
  c_pecho: number
  c_cintura: number
  c_abdominal: number
  c_cadera: number
  c_gluteo: number
  c_cuadricep: number
  c_cuadricep_max: number
  c_pantorrilla_max: number
  p_bicipital: number
  p_tricipital: number
  p_subescapular: number
  p_suprailiaco: number
  p_abdominal: number
  p_supraespinal: number
  p_cuadricep: number
  p_pantorrilla: number
  masa_muscular_total: number
  musculo_pct_formula: number
  grasa_4pliegues_pct: number
  grasa_4pliegues_kg: number
  masa_muscular_lee: number
  masa_muscular_lee_pct: number
  created_at: string
}
