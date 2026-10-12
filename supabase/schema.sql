-- ================================================================
-- WailNutrition — Supabase Schema (Version corrigée pour Supabase PG15)
-- Colle CE CONTENU dans SQL Editor → Run
-- ================================================================

-- ================================================================
-- USER SETTINGS
-- ================================================================
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  daily_calorie_goal integer not null default 1800,
  daily_protein_goal integer default 150,
  daily_carbs_goal integer default 200,
  daily_fat_goal integer default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into user_settings (user_id, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal)
values ('default', 1800, 150, 200, 60)
on conflict do nothing;

-- ================================================================
-- FOODS LIBRARY
-- ================================================================
create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serving_size_g numeric not null default 100,
  calories_per_serving numeric not null,
  protein_per_serving numeric default 0,
  carbs_per_serving numeric default 0,
  fat_per_serving numeric default 0,
  created_at timestamptz not null default now()
);

insert into foods (name, serving_size_g, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving) values
  ('Pâtes complètes (cuites)', 100, 124, 5.0, 25.0, 1.0),
  ('Riz basmati (cuit)', 100, 130, 2.8, 28.0, 0.3),
  ('Thon en boîte (au naturel)', 100, 116, 25.5, 0.0, 1.0),
  ('Poulet grillé (poitrine)', 100, 165, 31.0, 0.0, 3.6),
  ('Œufs entiers', 100, 155, 13.0, 1.1, 11.0),
  ('Blanc d''œuf', 100, 52, 11.0, 0.7, 0.2),
  ('Avoine / Flocons d''avoine', 100, 379, 13.0, 68.0, 7.0),
  ('Fromage blanc 0%', 100, 45, 8.0, 3.5, 0.1),
  ('Pain complet', 100, 247, 9.0, 47.0, 3.3),
  ('Brocoli', 100, 34, 2.8, 7.0, 0.4),
  ('Banane', 100, 89, 1.1, 23.0, 0.3),
  ('Amandes', 30, 174, 6.0, 6.0, 15.0),
  ('Huile d''olive', 10, 90, 0.0, 0.0, 10.0),
  ('Saumon', 100, 208, 20.0, 0.0, 14.0),
  ('Saucisse de poulet', 100, 185, 12.0, 3.0, 14.0)
on conflict do nothing;

-- ================================================================
-- MEAL LOGS
-- ================================================================
create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  food_id uuid references foods(id) on delete set null,
  food_name text not null,
  quantity_g numeric not null,
  calories numeric not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  meal_time text not null default 'lunch'
    check (meal_time in ('breakfast','lunch','dinner','snack')),
  logged_at timestamptz not null default now(),
  logged_date date not null default current_date
);

create index if not exists idx_meal_logs_date on meal_logs(logged_date desc);

-- ================================================================
-- EXERCISES LIBRARY
-- ================================================================
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null default 'other'
    check (muscle_group in (
      'chest','back','shoulders','biceps','triceps',
      'forearms','core','quadriceps','hamstrings',
      'glutes','calves','full_body','other'
    )),
  exercise_type text not null default 'strength'
    check (exercise_type in ('strength','cardio','flexibility','other')),
  description text,
  created_at timestamptz not null default now()
);

insert into exercises (name, muscle_group, exercise_type) values
  ('Développé couché (Bench Press)', 'chest', 'strength'),
  ('Squat barre', 'quadriceps', 'strength'),
  ('Soulevé de terre (Deadlift)', 'back', 'strength'),
  ('Tractions (Pull-ups)', 'back', 'strength'),
  ('Développé militaire (OHP)', 'shoulders', 'strength'),
  ('Curl biceps haltères', 'biceps', 'strength'),
  ('Dips triceps', 'triceps', 'strength'),
  ('Rowing barre', 'back', 'strength'),
  ('Presse à cuisses', 'quadriceps', 'strength'),
  ('Hip Thrust', 'glutes', 'strength'),
  ('Planche (Plank)', 'core', 'strength'),
  ('Course à pied', 'full_body', 'cardio')
on conflict do nothing;

-- ================================================================
-- WORKOUT SESSIONS
-- ================================================================
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_date date not null default current_date,
  notes text,
  duration_minutes integer,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_workout_sessions_date on workout_sessions(session_date desc);

-- ================================================================
-- WORKOUT SETS
-- ================================================================
create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  exercise_name text not null,
  set_number integer not null default 1,
  reps integer,
  weight_kg numeric,
  duration_seconds integer,
  notes text,
  is_personal_record boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_workout_sets_exercise on workout_sets(exercise_id, created_at desc);
create index if not exists idx_workout_sets_session on workout_sets(session_id);

-- ================================================================
-- PERSONAL RECORDS VIEW
-- ================================================================
create or replace view personal_records as
select distinct on (exercise_id)
  exercise_id,
  exercise_name,
  weight_kg as record_weight,
  reps as record_reps,
  (weight_kg * reps) as volume,
  created_at as achieved_at
from workout_sets
where weight_kg is not null and reps is not null
order by exercise_id, (weight_kg * reps) desc, created_at desc;

-- ================================================================
-- ACTIVITY LOG (streak)
-- ================================================================
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  activity_date date not null unique default current_date,
  has_nutrition boolean not null default false,
  has_workout boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_date on activity_log(activity_date desc);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table foods enable row level security;
alter table meal_logs enable row level security;
alter table exercises enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;
alter table user_settings enable row level security;
alter table activity_log enable row level security;

-- Allow all (single-user app, no auth)
create policy "Allow all" on foods for all using (true) with check (true);
create policy "Allow all" on meal_logs for all using (true) with check (true);
create policy "Allow all" on exercises for all using (true) with check (true);
create policy "Allow all" on workout_sessions for all using (true) with check (true);
create policy "Allow all" on workout_sets for all using (true) with check (true);
create policy "Allow all" on user_settings for all using (true) with check (true);
create policy "Allow all" on activity_log for all using (true) with check (true);
