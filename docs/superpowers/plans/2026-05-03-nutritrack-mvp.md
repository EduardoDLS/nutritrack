# NutriTrack MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el MVP completo de NutriTrack: auth, menú semanal generado por IA, lista del supermercado con checkboxes y dashboard de progreso.

**Architecture:** Server Components para todo lo que es lectura de datos. Client Components solo para interactividad (checkboxes, botones con estado, selector de días). Mutations vía Server Functions con `'use server'`. OpenAI llamado desde Route Handlers (`/api/*`).

**Tech Stack:** Next.js 16.2.4 (App Router, React 19), Supabase (auth + DB), Tailwind CSS v4, shadcn/ui con @base-ui/react, OpenAI gpt-4o, lucide-react v1+

---

## IMPORTANT: Breaking Changes vs Next.js 14

- `params` y `searchParams` en pages/layouts son **Promises** — siempre `await params`
- shadcn usa `@base-ui/react` — no importar de `@radix-ui`
- Tailwind v4 — colores en `oklch()` en CSS custom properties, no en `tailwind.config`
- Server Functions: `'use server'` al tope de la función async, no solo en archivos separados
- `Response.json()` nativo en route handlers, no `NextResponse.json()`

---

## File Map

```
src/
├── app/
│   ├── globals.css                          MODIFY — agregar paleta lavanda
│   ├── layout.tsx                           MODIFY — Plus Jakarta Sans, metadata
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                     CREATE — login form
│   ├── (dashboard)/
│   │   ├── layout.tsx                       CREATE — layout con BottomTabBar
│   │   ├── page.tsx                         CREATE — Dashboard
│   │   ├── menu/
│   │   │   └── page.tsx                     CREATE — Menú semanal
│   │   ├── shopping/
│   │   │   └── page.tsx                     CREATE — Lista del super
│   │   ├── progress/
│   │   │   └── page.tsx                     CREATE — Progreso (placeholder)
│   │   └── profile/
│   │       └── page.tsx                     CREATE — Perfil (placeholder)
│   └── api/
│       ├── generate-plan/
│       │   └── route.ts                     CREATE — OpenAI → weekly_plans
│       └── shopping-list/
│           └── route.ts                     CREATE — OpenAI → shopping_lists
├── components/
│   ├── layout/
│   │   └── bottom-tab-bar.tsx               CREATE — nav fija 5 íconos
│   └── features/
│       ├── today-menu.tsx                   CREATE — card menú del día
│       ├── progress-summary.tsx             CREATE — métricas horizontales
│       ├── generate-week-button.tsx         CREATE — botón con spinner
│       ├── day-selector.tsx                 CREATE — pills Lun-Dom
│       ├── meal-card.tsx                    CREATE — card de comida con ingredientes
│       ├── shopping-section.tsx             CREATE — sección agrupada
│       ├── shopping-item.tsx                CREATE — checkbox con optimistic update
│       └── export-button.tsx               CREATE — exportar lista
├── lib/
│   ├── supabase/                            EXISTING — client.ts, server.ts, middleware.ts
│   ├── openai/                              EXISTING — client.ts, prompts.ts
│   └── actions.ts                          CREATE — Server Functions para mutations
└── types/
    └── index.ts                             EXISTING — tipos globales
```

---

## Task 1: Supabase — Crear tablas y seed del menú

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Crear archivo de schema SQL**

```sql
-- supabase/schema.sql
create table if not exists menu_options (
  id uuid primary key default gen_random_uuid(),
  meal_time text not null check (meal_time in ('desayuno','almuerzo','comida','colacion','cena')),
  option_number smallint not null check (option_number in (1,2)),
  title text not null,
  ingredients jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists weekly_plans (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  plan jsonb not null,
  generated_at timestamptz default now(),
  is_active boolean default true
);

create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid references weekly_plans(id) on delete cascade,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  peso numeric,
  imc numeric,
  grasa_pct_bascula numeric,
  grasa_kg numeric,
  musculo_pct numeric,
  musculo_kg numeric,
  agua_pct numeric,
  grasa_visceral numeric,
  masa_osea numeric,
  c_brazo_relajado numeric,
  c_brazo_contraido numeric,
  diferencia_brazo numeric,
  c_pecho numeric,
  c_cintura numeric,
  c_abdominal numeric,
  c_cadera numeric,
  c_gluteo numeric,
  c_cuadricep numeric,
  c_cuadricep_max numeric,
  c_pantorrilla_max numeric,
  p_bicipital numeric,
  p_tricipital numeric,
  p_subescapular numeric,
  p_suprailiaco numeric,
  p_abdominal numeric,
  p_supraespinal numeric,
  p_cuadricep numeric,
  p_pantorrilla numeric,
  masa_muscular_total numeric,
  musculo_pct_formula numeric,
  grasa_4pliegues_pct numeric,
  grasa_4pliegues_kg numeric,
  masa_muscular_lee numeric,
  masa_muscular_lee_pct numeric,
  created_at timestamptz default now()
);
```

- [ ] **Step 2: Crear archivo de seed SQL**

```sql
-- supabase/seed.sql
insert into menu_options (meal_time, option_number, title, ingredients) values
('desayuno', 1, 'Fruta y gelatina', '[
  {"name":"papaya/melón/manzana","quantity":"1 taza o 1 pieza"},
  {"name":"gelatina light","quantity":"1 taza"}
]'),
('desayuno', 2, 'Licuado de avena', '[
  {"name":"avena","quantity":"2 cucharadas"},
  {"name":"papaya/manzana/fresas","quantity":"½ taza"},
  {"name":"almendras","quantity":"5 piezas"},
  {"name":"leche de almendras","quantity":"300ml"}
]'),
('almuerzo', 1, 'Huevo con frijoles y verduras', '[
  {"name":"huevo","quantity":"1 pieza"},
  {"name":"claras de huevo","quantity":"½ taza"},
  {"name":"frijoles de olla","quantity":"½ taza"},
  {"name":"aguacate","quantity":"1/3 pieza"},
  {"name":"nopales","quantity":"1 taza"},
  {"name":"espinacas","quantity":"al gusto"}
]'),
('almuerzo', 2, 'Sándwich de jamón con panela', '[
  {"name":"pan cero cero","quantity":"2 rebanadas"},
  {"name":"panela","quantity":"80g"},
  {"name":"jamón pechuga de pavo","quantity":"2 rebanadas"},
  {"name":"aguacate","quantity":"1/3 pieza"},
  {"name":"lechuga, jitomate, pepino","quantity":"al gusto"}
]'),
('comida', 1, 'Carne con arroz y verduras', '[
  {"name":"pollo o bistec","quantity":"150g"},
  {"name":"arroz","quantity":"1 taza"},
  {"name":"lechuga, jitomate, pepino","quantity":"al gusto"}
]'),
('comida', 2, 'Picadillo fitness', '[
  {"name":"carne molida de res","quantity":"150g"},
  {"name":"papa cocida","quantity":"1 taza"},
  {"name":"salmas","quantity":"1 paquete"},
  {"name":"calabaza y zanahoria","quantity":"1 taza"}
]'),
('colacion', 1, 'Fruta con yogur', '[
  {"name":"manzana/piña/melón","quantity":"1 pieza o 1 taza"},
  {"name":"yogur griego","quantity":"150g"},
  {"name":"almendras o arándanos","quantity":"10 piezas"},
  {"name":"té verde","quantity":"1 taza"}
]'),
('colacion', 2, 'Pre/Post entreno', '[
  {"name":"café","quantity":"1 taza"},
  {"name":"manzana o plátano","quantity":"1 pieza o ½"},
  {"name":"proteína iso hd","quantity":"1 scoop"},
  {"name":"creatina","quantity":"1 scoop"},
  {"name":"galleta de arroz","quantity":"1 pieza"},
  {"name":"crema de cacahuate","quantity":"1 cucharada"}
]'),
('cena', 1, 'Panes tostados con queso cottage y huevo', '[
  {"name":"panes tostados","quantity":"2 piezas"},
  {"name":"queso cottage","quantity":"80g"},
  {"name":"aguacate","quantity":"1/3 pieza"},
  {"name":"huevos cocidos","quantity":"2 piezas"},
  {"name":"espinacas, jitomate","quantity":"al gusto"},
  {"name":"gelatina light","quantity":"1 taza"}
]'),
('cena', 2, 'Carne con arroz y verduras (cena)', '[
  {"name":"pollo o bistec","quantity":"120g"},
  {"name":"arroz","quantity":"½ taza"},
  {"name":"aguacate","quantity":"1/3 pieza"},
  {"name":"pepino y jitomate","quantity":"1 taza"},
  {"name":"gelatina light","quantity":"1 taza"}
]');

-- Mediciones reales de referencia
insert into measurements (fecha, peso, imc, grasa_pct_bascula, grasa_kg, musculo_pct, c_cintura, c_abdominal, grasa_4pliegues_pct, grasa_4pliegues_kg) values
('2026-04-03', 110.55, 33.37, 27.9, 30.8, 36.5, 110.3, 117.9, 29.83, 32.98),
('2026-04-30', 107.9, 32.57, 27.3, 29.5, 36.7, 105.1, 111.2, 28.57, 30.83);
```

- [ ] **Step 3: Ejecutar en Supabase Dashboard**

Ir a **Supabase Dashboard → SQL Editor** y ejecutar primero `schema.sql`, luego `seed.sql`.

Verificar en **Table Editor** que existen las 4 tablas y `menu_options` tiene 10 filas.

- [ ] **Step 4: Habilitar Row Level Security (RLS)**

En Supabase Dashboard → Authentication → Policies, habilitar RLS en todas las tablas y crear políticas permisivas para el usuario autenticado:

```sql
-- Ejecutar en SQL Editor para cada tabla
alter table menu_options enable row level security;
alter table weekly_plans enable row level security;
alter table shopping_lists enable row level security;
alter table measurements enable row level security;

-- Políticas: solo usuario autenticado puede leer/escribir
create policy "auth_all" on menu_options for all to authenticated using (true) with check (true);
create policy "auth_all" on weekly_plans for all to authenticated using (true) with check (true);
create policy "auth_all" on shopping_lists for all to authenticated using (true) with check (true);
create policy "auth_all" on measurements for all to authenticated using (true) with check (true);
```

- [ ] **Step 5: Llenar .env.local**

Ir a **Supabase Dashboard → Settings → API** y copiar los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql supabase/seed.sql .env.local
git commit -m "feat: supabase schema, seed menu + mediciones"
```

---

## Task 2: Paleta de colores lavanda + fuente Plus Jakarta Sans

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Actualizar globals.css con paleta lavanda**

Reemplazar los valores de `:root` y `.dark` en `src/app/globals.css`. Los colores nuevos en oklch:

```css
/* src/app/globals.css — reemplazar bloque :root completo */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0.02 295);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 295);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 295);
  --primary: oklch(0.72 0.12 295);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.94 0.04 295);
  --secondary-foreground: oklch(0.4 0.08 295);
  --muted: oklch(0.97 0.01 295);
  --muted-foreground: oklch(0.55 0.04 295);
  --accent: oklch(0.92 0.05 185);
  --accent-foreground: oklch(0.3 0.08 185);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.02 295);
  --input: oklch(0.92 0.02 295);
  --ring: oklch(0.72 0.12 295);
  --radius: 1rem;
  --surface: oklch(0.985 0.005 295);
  --chart-1: oklch(0.72 0.12 295);
  --chart-2: oklch(0.70 0.12 310);
  --chart-3: oklch(0.78 0.08 185);
  --chart-4: oklch(0.85 0.08 60);
  --chart-5: oklch(0.75 0.10 20);
  --sidebar: oklch(0.985 0.005 295);
  --sidebar-foreground: oklch(0.2 0.02 295);
  --sidebar-primary: oklch(0.72 0.12 295);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.94 0.04 295);
  --sidebar-accent-foreground: oklch(0.4 0.08 295);
  --sidebar-border: oklch(0.92 0.02 295);
  --sidebar-ring: oklch(0.72 0.12 295);
}
```

También agregar `--color-surface: var(--surface);` en el bloque `@theme inline`.

- [ ] **Step 2: Actualizar layout.tsx con Plus Jakarta Sans**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NutriTrack',
  description: 'Seguimiento nutricional Team Pantera',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verificar que compila**

```bash
cd nutritrack && npm run dev
```

Abrir `http://localhost:3000` — debe cargar sin errores (verás la página default por ahora).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: paleta lavanda + Plus Jakarta Sans"
```

---

## Task 3: Auth — Login page + protección de rutas

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Modify: `src/middleware.ts` (ya existe, verificar)
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Crear login page**

```tsx
// src/app/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-sm p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">NutriTrack</h1>
          <p className="text-muted-foreground text-sm">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-10 px-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="tu@correo.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full h-10 px-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar middleware.ts existente**

El archivo `src/middleware.ts` ya existe con la lógica correcta. Verificar que el matcher no excluye la ruta `/login`:

```ts
// src/middleware.ts — debe quedar así (ya existe)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 3: Crear Server Function para logout**

```ts
// src/lib/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 4: Crear usuario en Supabase**

Ir a **Supabase Dashboard → Authentication → Users → Add user** y crear:
- Email: designdelossantos@gmail.com
- Password: (elegir una)

- [ ] **Step 5: Verificar login funciona**

```bash
npm run dev
```

Abrir `http://localhost:3000` — debe redirigir a `/login`. Ingresar credenciales — debe redirigir a `/` (404 por ahora, es correcto).

- [ ] **Step 6: Commit**

```bash
git add src/app/\(auth\)/ src/lib/actions.ts
git commit -m "feat: auth login + middleware + signOut action"
```

---

## Task 4: Layout del dashboard + BottomTabBar

**Files:**
- Create: `src/components/layout/bottom-tab-bar.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/progress/page.tsx`
- Create: `src/app/(dashboard)/profile/page.tsx`

- [ ] **Step 1: Crear BottomTabBar**

```tsx
// src/components/layout/bottom-tab-bar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, ShoppingCart, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menú' },
  { href: '/shopping', icon: ShoppingCart, label: 'Super' },
  { href: '/progress', icon: TrendingUp, label: 'Progreso' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-card border-t border-border max-w-[430px] mx-auto">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              'flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('size-5', active && 'stroke-[2.5px]')} />
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Crear dashboard layout**

```tsx
// src/app/(dashboard)/layout.tsx
import { BottomTabBar } from '@/components/layout/bottom-tab-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen max-w-[430px] mx-auto bg-background">
      <main className="pb-20">{children}</main>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 3: Crear placeholders para progress y profile**

```tsx
// src/app/(dashboard)/progress/page.tsx
export default function ProgressPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Progreso</h1>
      <p className="text-muted-foreground mt-2">Próximamente — Fase 2</p>
    </div>
  )
}
```

```tsx
// src/app/(dashboard)/profile/page.tsx
export default function ProfilePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Perfil</h1>
      <p className="text-muted-foreground mt-2">Próximamente — Fase 2</p>
    </div>
  )
}
```

- [ ] **Step 4: Verificar navegación**

```bash
npm run dev
```

Loguearse → ver la tab bar en la parte inferior. Navegar entre tabs, verificar que el ícono activo cambia a color lavanda.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/\(dashboard\)/layout.tsx src/app/\(dashboard\)/progress/ src/app/\(dashboard\)/profile/
git commit -m "feat: dashboard layout + BottomTabBar"
```

---

## Task 5: API /api/generate-plan

**Files:**
- Create: `src/app/api/generate-plan/route.ts`

- [ ] **Step 1: Crear route handler**

```ts
// src/app/api/generate-plan/route.ts
import { createClient } from '@/lib/supabase/server'
import { openai, MODEL } from '@/lib/openai/client'
import { buildGeneratePlanPrompt } from '@/lib/openai/prompts'
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

  const prompt = buildGeneratePlanPrompt(options as MenuOption[])

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const plan = JSON.parse(completion.choices[0].message.content ?? '{}')

  // Desactivar plan anterior
  await supabase.from('weekly_plans').update({ is_active: false }).eq('is_active', true)

  // Calcular inicio de semana (lunes)
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0]

  const { data: newPlan, error: insertError } = await supabase
    .from('weekly_plans')
    .insert({ week_start: weekStart, plan, is_active: true })
    .select()
    .single()

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })

  return Response.json({ plan: newPlan })
}
```

- [ ] **Step 2: Verificar que el endpoint responde**

Con el servidor corriendo y sesión activa, en otro terminal:

```bash
curl -X POST http://localhost:3000/api/generate-plan \
  -H "Cookie: $(cat /tmp/cookies.txt)" 
```

O probar desde el dashboard (Task 6) una vez construido.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generate-plan/
git commit -m "feat: API generate-plan con OpenAI"
```

---

## Task 6: Dashboard — página principal

**Files:**
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/components/features/today-menu.tsx`
- Create: `src/components/features/progress-summary.tsx`
- Create: `src/components/features/generate-week-button.tsx`

- [ ] **Step 1: Crear TodayMenu component**

```tsx
// src/components/features/today-menu.tsx
import { ChevronRight } from 'lucide-react'
import type { MenuOption, WeeklyPlan, MealTime } from '@/types'
import { cn } from '@/lib/utils'

const MEAL_LABELS: Record<MealTime, { label: string; time: string }> = {
  desayuno: { label: 'Desayuno', time: '9am' },
  almuerzo: { label: 'Almuerzo', time: '11am' },
  comida: { label: 'Comida', time: '2pm' },
  colacion: { label: 'Colación', time: '5pm' },
  cena: { label: 'Cena', time: '9pm' },
}

const MEAL_ORDER: MealTime[] = ['desayuno', 'almuerzo', 'comida', 'colacion', 'cena']

function getCurrentMealTime(): MealTime {
  const hour = new Date().getHours()
  if (hour < 10) return 'desayuno'
  if (hour < 13) return 'almuerzo'
  if (hour < 17) return 'comida'
  if (hour < 21) return 'colacion'
  return 'cena'
}

interface Props {
  plan: WeeklyPlan | null
  options: MenuOption[]
}

export function TodayMenu({ plan, options }: Props) {
  const currentMeal = getCurrentMealTime()

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const
  const todayKey = days[new Date().getDay()]
  const todayPlan = plan?.plan[todayKey]

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-3">Menú de hoy</h2>
      {MEAL_ORDER.map(mealTime => {
        const meta = MEAL_LABELS[mealTime]
        const optionNum = todayPlan?.[mealTime]
        const option = options.find(o => o.meal_time === mealTime && o.option_number === optionNum)
        const isActive = mealTime === currentMeal

        return (
          <div
            key={mealTime}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors',
              isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
            )}
          >
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full min-w-[40px] text-center',
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {meta.time}
            </span>
            <span className="flex-1 text-sm font-medium text-foreground truncate">
              {option ? option.title : 'Sin plan'}
            </span>
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          </div>
        )
      })}
      {!plan && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Genera tu primer plan semanal
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crear ProgressSummary component**

```tsx
// src/components/features/progress-summary.tsx
import type { Measurement } from '@/types'

interface Props {
  latest: Measurement | null
}

function Delta({ value, prev }: { value: number | null; prev: number | null }) {
  if (!value || !prev) return null
  const diff = value - prev
  const isPositive = diff > 0
  return (
    <span className={`text-xs font-medium ${isPositive ? 'text-destructive' : 'text-accent-foreground'}`}>
      {isPositive ? '+' : ''}{diff.toFixed(1)}
    </span>
  )
}

export function ProgressSummary({ latest }: Props) {
  if (!latest) return null

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm">
      <h2 className="text-base font-semibold text-foreground mb-3">Mi progreso</h2>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="text-lg font-bold text-foreground">{latest.peso}</p>
          <p className="text-xs text-muted-foreground">kg</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Grasa</p>
          <p className="text-lg font-bold text-foreground">{latest.grasa_pct_bascula}</p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Músculo</p>
          <p className="text-lg font-bold text-foreground">{latest.musculo_pct}</p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear GenerateWeekButton component**

```tsx
// src/components/features/generate-week-button.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function GenerateWeekButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/generate-plan', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al generar el plan')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base gap-2 hover:bg-primary/90"
      >
        <Sparkles className="size-4" />
        {loading ? 'Generando semana...' : 'Generar semana con IA'}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Crear Dashboard page**

```tsx
// src/app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server'
import { TodayMenu } from '@/components/features/today-menu'
import { ProgressSummary } from '@/components/features/progress-summary'
import { GenerateWeekButton } from '@/components/features/generate-week-button'
import type { MenuOption, WeeklyPlan, Measurement } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [optionsRes, planRes, measurementRes] = await Promise.all([
    supabase.from('menu_options').select('*').order('meal_time'),
    supabase.from('weekly_plans').select('*').eq('is_active', true).maybeSingle(),
    supabase.from('measurements').select('*').order('fecha', { ascending: false }).limit(1).maybeSingle(),
  ])

  const options = (optionsRes.data ?? []) as MenuOption[]
  const plan = planRes.data as WeeklyPlan | null
  const latest = measurementRes.data as Measurement | null

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const
  const todayName = days[new Date().getDay()]
  const todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Hola, Miguel</h1>
          <p className="text-sm text-muted-foreground capitalize">{todayDate}</p>
        </div>
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">M</span>
        </div>
      </div>

      <TodayMenu plan={plan} options={options} />
      <ProgressSummary latest={latest} />
      <GenerateWeekButton />
    </div>
  )
}
```

- [ ] **Step 5: Verificar dashboard**

```bash
npm run dev
```

Abrir `http://localhost:3000` con sesión activa. Debe mostrar:
- Header con "Hola, Miguel" y la fecha
- Card "Menú de hoy" con las 5 comidas
- Card "Mi progreso" con las métricas del 30/04
- Botón "Generar semana con IA"
- Bottom tab bar

- [ ] **Step 6: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx src/components/features/today-menu.tsx src/components/features/progress-summary.tsx src/components/features/generate-week-button.tsx
git commit -m "feat: dashboard con menú de hoy, progreso y botón generar"
```

---

## Task 7: Menú semanal

**Files:**
- Create: `src/app/(dashboard)/menu/page.tsx`
- Create: `src/components/features/day-selector.tsx`
- Create: `src/components/features/meal-card.tsx`

- [ ] **Step 1: Crear DaySelector component**

```tsx
// src/components/features/day-selector.tsx
'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { DayOfWeek, MenuOption, WeekPlan } from '@/types'
import { MealCard } from './meal-card'

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'lunes', label: 'Lun' },
  { key: 'martes', label: 'Mar' },
  { key: 'miercoles', label: 'Mié' },
  { key: 'jueves', label: 'Jue' },
  { key: 'viernes', label: 'Vie' },
  { key: 'sabado', label: 'Sáb' },
  { key: 'domingo', label: 'Dom' },
]

const MEAL_ORDER = ['desayuno', 'almuerzo', 'comida', 'colacion', 'cena'] as const

interface Props {
  plan: WeekPlan
  options: MenuOption[]
}

export function DaySelector({ plan, options }: Props) {
  const jsDay = new Date().getDay()
  const todayKey = DAYS[jsDay === 0 ? 6 : jsDay - 1].key
  const [selected, setSelected] = useState<DayOfWeek>(todayKey)

  const dayPlan = plan[selected]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selected === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {MEAL_ORDER.map(mealTime => {
          const optionNum = dayPlan?.[mealTime]
          const option = options.find(o => o.meal_time === mealTime && o.option_number === optionNum)
          return (
            <MealCard
              key={mealTime}
              mealTime={mealTime}
              option={option ?? null}
              optionNum={optionNum ?? null}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear MealCard component**

```tsx
// src/components/features/meal-card.tsx
import type { MenuOption, MealTime } from '@/types'

const MEAL_META: Record<MealTime, { label: string; time: string }> = {
  desayuno: { label: 'Desayuno', time: '9–10am' },
  almuerzo: { label: 'Almuerzo', time: '11am' },
  comida: { label: 'Comida', time: '2pm' },
  colacion: { label: 'Colación', time: '5pm' },
  cena: { label: 'Cena', time: '9–10pm' },
}

const PILL_COLORS = [
  'bg-primary/10 text-primary',
  'bg-accent/30 text-accent-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-chart-2/10 text-chart-2',
]

interface Props {
  mealTime: MealTime
  option: MenuOption | null
  optionNum: number | null
}

export function MealCard({ mealTime, option, optionNum }: Props) {
  const meta = MEAL_META[mealTime]

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">{meta.label} · {meta.time}</span>
          {optionNum && (
            <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Opción {optionNum}
            </span>
          )}
        </div>
      </div>
      {option ? (
        <>
          <p className="text-sm font-semibold text-foreground">{option.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {option.ingredients.slice(0, 4).map((ing, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${PILL_COLORS[i % PILL_COLORS.length]}`}
              >
                {ing.name}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Sin asignar</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crear Menu page**

```tsx
// src/app/(dashboard)/menu/page.tsx
import { createClient } from '@/lib/supabase/server'
import { DaySelector } from '@/components/features/day-selector'
import type { MenuOption, WeeklyPlan } from '@/types'

export default async function MenuPage() {
  const supabase = await createClient()

  const [optionsRes, planRes] = await Promise.all([
    supabase.from('menu_options').select('*').order('meal_time'),
    supabase.from('weekly_plans').select('*').eq('is_active', true).maybeSingle(),
  ])

  const options = (optionsRes.data ?? []) as MenuOption[]
  const plan = planRes.data as WeeklyPlan | null

  if (!plan) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold pt-2">Menú semanal</h1>
        <div className="bg-card rounded-3xl p-8 text-center shadow-sm">
          <p className="text-muted-foreground">No hay plan activo.</p>
          <p className="text-sm text-muted-foreground mt-1">Genera tu primer plan desde el Dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold pt-2">Menú semanal</h1>
      <DaySelector plan={plan.plan} options={options} />
    </div>
  )
}
```

- [ ] **Step 4: Verificar menú semanal**

Con un plan generado, ir a la tab Menú. Verificar:
- Selector de días scroll horizontal
- Día actual seleccionado por defecto
- 5 cards con comidas del día seleccionado
- Ingredientes como pills de colores

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/menu/ src/components/features/day-selector.tsx src/components/features/meal-card.tsx
git commit -m "feat: página menú semanal con selector de días"
```

---

## Task 8: API /api/shopping-list

**Files:**
- Create: `src/app/api/shopping-list/route.ts`

- [ ] **Step 1: Crear route handler**

```ts
// src/app/api/shopping-list/route.ts
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
    supabase.from('menu_options').select('*'),
  ])

  if (planRes.error || !planRes.data) {
    return Response.json({ error: 'Plan no encontrado' }, { status: 404 })
  }

  const prompt = buildShoppingListPrompt(optionsRes.data as MenuOption[], planRes.data.plan)

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const { items } = JSON.parse(completion.choices[0].message.content ?? '{"items":[]}')

  const { data: shoppingList, error } = await supabase
    .from('shopping_lists')
    .insert({ weekly_plan_id, items })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ shopping_list: shoppingList })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/shopping-list/
git commit -m "feat: API shopping-list con OpenAI"
```

---

## Task 9: Lista del supermercado

**Files:**
- Create: `src/app/(dashboard)/shopping/page.tsx`
- Create: `src/components/features/shopping-section.tsx`
- Create: `src/components/features/shopping-item.tsx`
- Create: `src/components/features/export-button.tsx`
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Agregar Server Functions para shopping**

Agregar al final de `src/lib/actions.ts`:

```ts
// Agregar en src/lib/actions.ts
import { revalidatePath } from 'next/cache'

export async function toggleShoppingItem(listId: string, itemIndex: number, checked: boolean) {
  'use server'
  const supabase = await createClient()
  const { data } = await supabase.from('shopping_lists').select('items').eq('id', listId).single()
  if (!data) return

  const items = [...data.items]
  items[itemIndex] = { ...items[itemIndex], checked }

  await supabase.from('shopping_lists').update({ items }).eq('id', listId)
  revalidatePath('/shopping')
}

export async function generateShoppingList(weeklyPlanId: string) {
  'use server'
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'vercel.app') ?? 'http://localhost:3000'}/api/shopping-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekly_plan_id: weeklyPlanId }),
  })
  revalidatePath('/shopping')
  return res.ok
}
```

- [ ] **Step 2: Crear ShoppingItem component**

```tsx
// src/components/features/shopping-item.tsx
'use client'
import { useTransition } from 'react'
import { toggleShoppingItem } from '@/lib/actions'
import type { ShoppingItem as ShoppingItemType } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  item: ShoppingItemType
  index: number
  listId: string
}

export function ShoppingItem({ item, index, listId }: Props) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => {
      toggleShoppingItem(listId, index, !item.checked)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="flex items-center gap-3 w-full py-2.5 text-left"
    >
      <div className={cn(
        'size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
        item.checked ? 'bg-primary border-primary' : 'border-border'
      )}>
        {item.checked && (
          <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className={cn('flex-1 min-w-0', item.checked && 'opacity-50')}>
        <span className={cn('text-sm text-foreground', item.checked && 'line-through')}>
          {item.name}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          {item.quantity} {item.unit}
        </span>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: Crear ShoppingSection component**

```tsx
// src/components/features/shopping-section.tsx
import type { ShoppingItem as ShoppingItemType } from '@/types'
import { ShoppingItem } from './shopping-item'

interface Props {
  title: string
  items: ShoppingItemType[]
  startIndex: number
  listId: string
}

export function ShoppingSection({ title, items, startIndex, listId }: Props) {
  if (!items.length) return null

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {title}
      </h3>
      <div className="bg-card rounded-3xl px-4 shadow-sm divide-y divide-border">
        {items.map((item, i) => (
          <ShoppingItem
            key={i}
            item={item}
            index={startIndex + i}
            listId={listId}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear ExportButton component**

```tsx
// src/components/features/export-button.tsx
'use client'
import type { ShoppingItem } from '@/types'
import { Button } from '@/components/ui/button'

interface Props {
  items: ShoppingItem[]
}

export function ExportButton({ items }: Props) {
  function handleExport() {
    const sections = ['Carnes', 'Verduras', 'Lácteos', 'Abarrotes', 'Suplementos'] as const
    const lines = sections.flatMap(section => {
      const sectionItems = items.filter(i => i.section === section)
      if (!sectionItems.length) return []
      return [`\n${section}:`, ...sectionItems.map(i => `- ${i.name}: ${i.quantity} ${i.unit}`)]
    })
    const text = `Lista del Super\n${lines.join('\n')}`
    navigator.clipboard.writeText(text)
    alert('Lista copiada al portapapeles')
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className="rounded-full text-xs"
    >
      Exportar
    </Button>
  )
}
```

- [ ] **Step 5: Crear Shopping page**

```tsx
// src/app/(dashboard)/shopping/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ShoppingSection } from '@/components/features/shopping-section'
import { ExportButton } from '@/components/features/export-button'
import type { ShoppingItem, ShoppingList, WeeklyPlan } from '@/types'

const SECTIONS = ['Carnes', 'Verduras', 'Lácteos', 'Abarrotes', 'Suplementos'] as const

export default async function ShoppingPage() {
  const supabase = await createClient()

  const planRes = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  const plan = planRes.data as WeeklyPlan | null

  if (!plan) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold pt-2">Lista del super</h1>
        <div className="bg-card rounded-3xl p-8 text-center shadow-sm mt-4">
          <p className="text-muted-foreground">Genera un plan semanal primero.</p>
        </div>
      </div>
    )
  }

  const listRes = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('weekly_plan_id', plan.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const list = listRes.data as ShoppingList | null
  const items = (list?.items ?? []) as ShoppingItem[]
  const checkedCount = items.filter(i => i.checked).length

  const weekStart = plan.week_start
    ? new Date(plan.week_start + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    : ''

  // Calcular índice acumulado para que cada item tenga su índice global correcto
  let sectionStartIndex = 0

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold">Lista del super</h1>
          <p className="text-sm text-muted-foreground">Semana del {weekStart}</p>
        </div>
        {list && <ExportButton items={items} />}
      </div>

      {list ? (
        <>
          <div className="bg-card rounded-3xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{checkedCount} de {items.length} items</span>
              <span className="text-primary font-medium">{Math.round((checkedCount / items.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(checkedCount / items.length) * 100}%` }}
              />
            </div>
          </div>

          {SECTIONS.map(section => {
            const sectionItems = items.filter(i => i.section === section)
            const startIdx = sectionStartIndex
            sectionStartIndex += sectionItems.length
            return (
              <ShoppingSection
                key={section}
                title={section}
                items={sectionItems}
                startIndex={startIdx}
                listId={list.id}
              />
            )
          })}
        </>
      ) : (
        <div className="bg-card rounded-3xl p-8 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">No hay lista generada para esta semana.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Usa el botón "Generar semana con IA" desde el Dashboard y luego genera la lista.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verificar lista del super**

Con un plan activo y lista generada:
- Checkboxes en lavanda al marcar
- Item tachado y opaco al marcar
- Progress bar actualiza
- Botón Exportar copia al portapapeles

- [ ] **Step 7: Commit**

```bash
git add src/app/\(dashboard\)/shopping/ src/components/features/shopping-section.tsx src/components/features/shopping-item.tsx src/components/features/export-button.tsx src/lib/actions.ts src/app/api/shopping-list/
git commit -m "feat: lista del super con checkboxes persistentes y exportar"
```

---

## Self-Review

**Spec coverage:**
- [x] Supabase tablas + seed → Task 1
- [x] Auth email + middleware → Task 3
- [x] Root layout + BottomTabBar → Tasks 2, 4
- [x] Dashboard 3 widgets → Task 6
- [x] API generate-plan → Task 5
- [x] Menú semanal 7×5 → Task 7
- [x] API shopping-list → Task 8
- [x] Lista super + checkboxes + exportar → Task 9
- [x] Paleta lavanda + Plus Jakarta Sans → Task 2
- [x] Manejo errores OpenAI → Tasks 5, 6 (spinner + toast)
- [x] Estado vacío sin plan → Tasks 6, 7, 9

**Fase 2 (fuera de scope de este plan):** extract-pdf, Progreso con Recharts, Perfil con uploader.

**Type consistency:**
- `MenuOption`, `WeeklyPlan`, `WeekPlan`, `ShoppingItem`, `Measurement` todos definidos en `src/types/index.ts`
- `toggleShoppingItem(listId, itemIndex, checked)` — firma consistente entre `actions.ts` y `shopping-item.tsx`
- `buildGeneratePlanPrompt` y `buildShoppingListPrompt` — firmados en `lib/openai/prompts.ts` y usados correctamente
