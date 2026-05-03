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
  peso numeric, imc numeric, grasa_pct_bascula numeric, grasa_kg numeric,
  musculo_pct numeric, musculo_kg numeric, agua_pct numeric,
  grasa_visceral numeric, masa_osea numeric,
  c_brazo_relajado numeric, c_brazo_contraido numeric, diferencia_brazo numeric,
  c_pecho numeric, c_cintura numeric, c_abdominal numeric,
  c_cadera numeric, c_gluteo numeric, c_cuadricep numeric,
  c_cuadricep_max numeric, c_pantorrilla_max numeric,
  p_bicipital numeric, p_tricipital numeric, p_subescapular numeric,
  p_suprailiaco numeric, p_abdominal numeric, p_supraespinal numeric,
  p_cuadricep numeric, p_pantorrilla numeric,
  masa_muscular_total numeric, musculo_pct_formula numeric,
  grasa_4pliegues_pct numeric, grasa_4pliegues_kg numeric,
  masa_muscular_lee numeric, masa_muscular_lee_pct numeric,
  created_at timestamptz default now()
);
