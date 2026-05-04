# NutriTrack — App Fitness & Nutrición

Proyecto personal de seguimiento nutricional vinculado al nutriólogo L.N. Miguel Oropeza (Team Pantera).

---

## Estado actual del proyecto — 03/05/2026 (sesión 2)

### ✅ COMPLETADO Y EN PRODUCCIÓN

**Deploy:** Vercel (conectado a GitHub `EduardoDLS/nutritrack`, auto-deploy en push a `main`)
**Repo:** https://github.com/EduardoDLS/nutritrack
**Supabase project:** `nqauiatfeabxyjdkyqfc`

Todas las fases 1 y 2 están completas y funcionando en producción.

---

### Lo que ya funciona

| Pantalla | Estado | Notas |
|---|---|---|
| Login / Registro | ✅ | Registro con nombre, login con email+password |
| Dashboard | ✅ | Menú hoy clickeable con detalle de receta, resumen progreso, botón generar semana |
| Menú semanal | ✅ | Tabla 7 días × 5 tiempos, día actual resaltado, celdas clickeables con detalle de receta |
| Lista del Super | ✅ | Checkboxes persistentes, agrupada por sección (incluye Frutas), generada automáticamente con el plan |
| Progreso | ✅ | Cards con delta ↑↓, gráficas Recharts, tabla comparativa |
| Perfil / PDF | ✅ | Uploader PDF extrae menú Y mediciones en una sola llamada |

| API | Estado | Notas |
|---|---|---|
| `POST /api/generate-plan` | ✅ | Genera plan + lista del super; valida opciones en código antes de guardar |
| `POST /api/shopping-list` | ✅ | Ingredientes enumerados en código (no por GPT); carnes en piezas, verduras/frutas completas |
| `POST /api/extract-pdf` | ✅ | Detecta si el PDF tiene menú, mediciones o ambos; extrae preparación de recetas |

---

### Arquitectura actual

**Multi-usuario completo** — cada usuario tiene datos completamente separados:
- `menu_options` — menú personal extraído del PDF del nutriólogo de cada usuario
- `weekly_plans` — plan semanal generado para cada usuario
- `shopping_lists` — lista del super de cada usuario
- `measurements` — historial de mediciones de cada usuario

Todas las tablas tienen columna `user_id uuid references auth.users(id)` con RLS activo (`auth.uid() = user_id`).

**Flujo PDF inteligente:**
1. Usuario sube PDF del nutriólogo
2. OpenAI detecta qué contiene: menú, mediciones, o ambos
3. Si tiene menú → reemplaza el menú anterior del usuario (siempre usa el más reciente); extrae título, ingredientes y preparación de cada opción
4. Si tiene mediciones → agrega al historial
5. Al generar semana → usa el menú vigente del usuario

**Modal de detalle de receta:**
- Tapping cualquier comida en Dashboard (menú de hoy) o en Menú semanal abre un modal centrado
- Muestra: título, lista de ingredientes con cantidades, y preparación textual tal como viene en el PDF
- Header fijo con botón X, cuerpo con scroll independiente
- Altura máxima `calc(100dvh - 80px)` — respeta barra del navegador en iOS/Android

**Generación de plan semanal — infraestructura robusta (sesión 2):**
- `buildAvailabilityMap()` calcula qué números de opción existen por tiempo de comida
- `buildGeneratePlanPrompt()` le pasa a GPT la disponibilidad explícita por tiempo — GPT ya no puede inventar opción 2 si no existe
- `validatePlan()` revisa cada celda del JSON devuelto por GPT y corrige cualquier número inválido antes de guardar (red de seguridad)
- `enumerateIngredients()` itera los 35 slots del plan en código TypeScript y extrae todos los ingredientes con sus cantidades exactas — GPT no hace ningún conteo ni suma
- `buildShoppingListPrompt()` recibe la lista ya enumerada; GPT solo categoriza y formatea presentaciones comerciales
- Sección `Frutas` agregada como categoría independiente en lista del super y en tipos

---

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Base de datos + Auth**: Supabase (`nqauiatfeabxyjdkyqfc`)
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **IA**: OpenAI API — modelo `gpt-4o`
- **PDF parsing**: `pdf-parse` v1.1.1 (en `serverExternalPackages`)
- **Gráficas**: Recharts
- **Deploy**: Vercel
- **Repo**: GitHub — `EduardoDLS/nutritrack`

---

## Diseño visual

- Paleta pastel: **azul-morado** primario (`oklch(0.58 0.18 278)`), fondo lavanda suave
- Tipografía: Plus Jakarta Sans
- Cards blancas con sombra sobre fondo lavanda
- Bottom tab bar flotante (separada de las orillas, bordes redondeados, frosted glass)
- Mobile-first — max-width 430px
- PWA configurada — ícono morado con silueta gym para iPhone

---

## Variables de entorno (en Vercel y .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://nqauiatfeabxyjdkyqfc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

---

## Base de datos (Supabase)

Todas las tablas tienen `user_id uuid references auth.users(id)` y RLS activo.

```sql
menu_options      (id, meal_time, option_number, title, ingredients jsonb, preparation text, user_id, created_at)
weekly_plans      (id, week_start date, plan jsonb, is_active boolean, user_id, created_at)
shopping_lists    (id, weekly_plan_id, items jsonb, user_id, created_at)
measurements      (id, fecha date, peso, imc, grasa_pct_bascula, grasa_kg, musculo_pct,
                   musculo_kg, agua_pct, grasa_visceral, masa_osea, c_brazo_relajado,
                   c_brazo_contraido, diferencia_brazo, c_pecho, c_cintura, c_abdominal,
                   c_cadera, c_gluteo, c_cuadricep, c_cuadricep_max, c_pantorrilla_max,
                   p_bicipital, p_tricipital, p_subescapular, p_suprailiaco, p_abdominal,
                   p_supraespinal, p_cuadricep, p_pantorrilla, masa_muscular_total,
                   musculo_pct_formula, grasa_4pliegues_pct, grasa_4pliegues_kg,
                   masa_muscular_lee, masa_muscular_lee_pct, user_id, created_at)
```

---

## Posibles mejoras futuras (no implementadas)

- Notificaciones de recordatorio de comidas
- Exportar lista del super (PDF / compartir)
- Modo oscuro
- Ingesta manual de mediciones (sin PDF)
- Historial de planes anteriores
- Gráficas más detalladas por métrica individual

---

## Convenciones de código

- Sin comentarios a menos que el WHY sea no obvio
- Sin emojis en código
- Preferir editar archivos existentes sobre crear nuevos
- Implementaciones limpias y mínimas — sin over-engineering
- TypeScript estricto
- Responder en español en comunicación, inglés en código/variables
