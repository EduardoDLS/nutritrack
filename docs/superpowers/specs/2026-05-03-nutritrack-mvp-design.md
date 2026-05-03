# NutriTrack MVP — Design Spec
**Fecha:** 2026-05-03  
**Estado:** Aprobado

---

## Contexto

App personal de seguimiento nutricional vinculada al plan del nutriólogo L.N. Miguel Oropeza (Team Pantera). El objetivo es digitalizar el menú semanal, automatizar la lista del supermercado con IA y visualizar el progreso corporal a lo largo del tiempo.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Auth + DB + Storage:** Supabase
- **Estilos:** Tailwind CSS + shadcn/ui
- **IA:** OpenAI `gpt-4o`
- **Deploy:** Vercel

---

## Arquitectura

```
(auth)/login              → Supabase email auth
(dashboard)/              → layout.tsx con BottomTabBar
  ├── page.tsx            → Dashboard
  ├── menu/               → Menú semanal
  ├── shopping/           → Lista del super
  ├── progress/           → Progreso corporal
  └── profile/            → Perfil / subir PDF

API routes (server-only):
  ├── /api/generate-plan  → OpenAI → weekly_plans
  ├── /api/shopping-list  → OpenAI → shopping_lists
  └── /api/extract-pdf    → OpenAI vision → measurements
```

**Flujo de datos:** Supabase DB → Server Components → props → Client Components. Mutations vía API Routes + `revalidatePath`.

**Auth:** Middleware protege todo `/(dashboard)/*`. Sin roles — app de un solo usuario.

---

## Diseño Visual

- **Paleta:** Lavanda suave `#b39ddb` como primario, lila `#ce93d8` y verde menta `#80cbc4` como acentos
- **Fondo:** Blanco puro, superficies en `#f8f7ff`
- **Tipografía:** Plus Jakarta Sans en todos los niveles
- **Border radius:** Generoso — estilo pill en botones (`ROUND_FULL`)
- **Navegación:** Bottom tab bar fija, 5 íconos sin texto, activo en lavanda
- **Mobile-first:** max-width 430px, responsive en desktop

---

## Pantallas

### 1. Dashboard
- **Prioridad 1:** Card "Menú de hoy" — 5 filas (Desayuno, Almuerzo, Comida, Colación, Cena) con tiempo, nombre del platillo y chevron. Fila activa con fondo lavanda suave.
- **Prioridad 2:** Card "Mi progreso" — métricas horizontales: peso, % grasa, % músculo.
- **Prioridad 3:** Botón pill "Generar semana con IA" — primario lavanda, muestra spinner durante generación.

### 2. Menú semanal
- Selector horizontal de días (pills: Lun–Dom), activo en lavanda.
- 5 cards verticales por día: tiempo + hora, badge "Opción 1/2", título, ingredientes clave como pills pasteles.

### 3. Lista del super
- Header con progreso "12 de 28 items" + barra lavanda.
- Secciones agrupadas: Carnes, Verduras, Lácteos, Abarrotes, Suplementos.
- Checkboxes lavanda. Items marcados con strikethrough y color atenuado.
- Botón "Exportar" en header.

### 4. Progreso (Fase 2)
- Cards con delta ↑↓ para métricas clave.
- Gráficas de línea (Recharts) para peso, % grasa, % músculo.
- Tabla comparativa mes anterior vs actual.

### 5. Perfil (Fase 2)
- Uploader de PDF del nutriólogo.
- Historial de mediciones.

---

## Componentes

| Pantalla | Componentes |
|---|---|
| Shared | `BottomTabBar`, `MetricBadge` |
| Dashboard | `TodayMenu`, `ProgressSummary`, `GenerateWeekButton` |
| Menú | `DaySelector`, `WeeklyTable`, `MealCard`, `IngredientPill` |
| Super | `ShoppingSection`, `ShoppingItem`, `ExportButton` |
| Progreso | `MetricCard`, `ProgressChart`, `MeasurementTable` |
| Perfil | `PdfUploader`, `MeasurementHistory` |

---

## Manejo de Errores

| Escenario | Comportamiento |
|---|---|
| OpenAI tarda/falla | Spinner en botón → toast de error → plan anterior intacto |
| Sin plan activo | Estado vacío con CTA "Genera tu primer plan" |
| Checkbox desconectado | Optimistic update → revert si Supabase falla |
| PDF inválido | Mensaje "No se pudo leer el PDF" sin crash |
| Sin sesión | Middleware redirige a `/login` |

---

## Orden de Implementación

### Fase 1 — MVP
1. Configurar Supabase (tablas + seed del menú)
2. Auth con Supabase (login email, middleware)
3. Root layout + BottomTabBar
4. Dashboard con 3 widgets
5. API `/api/generate-plan`
6. Página Menú semanal
7. API `/api/shopping-list`
8. Página Lista del super + checkboxes persistentes

### Fase 2 — Progreso
9. API `/api/extract-pdf`
10. Página Perfil — subir PDF
11. Página Progreso — cards + gráficas

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```
