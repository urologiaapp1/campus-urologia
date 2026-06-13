-- ============================================================
-- Campus Urología Sur — Esquema Supabase
-- Ejecutar completo en: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- ---------- TABLAS ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('admin','editor','student')),
  created_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  kind text not null default 'diplomado' check (kind in ('diplomado','magister','curso')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  title text not null,
  position int not null default 0
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  kind text not null default 'video' check (kind in ('video','documento','texto')),
  drive_file_id text,          -- ID del archivo en el Drive del administrador
  body text,                   -- para lecciones de texto
  duration_min int,
  position int not null default 0
);

create table public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null default 'Evaluación',
  pass_score int not null default 60
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,        -- ["opción A","opción B",...]
  correct_index int not null,
  position int not null default 0
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score int not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- PERFIL AUTOMÁTICO AL CREAR USUARIO ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'role','student')
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- HELPERS DE ROL ----------

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean language sql stable as $$
  select public.my_role() in ('admin','editor')
$$;

create or replace function public.is_enrolled(p_program uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.enrollments where user_id = auth.uid() and program_id = p_program)
$$;

-- ---------- ROW LEVEL SECURITY ----------

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- profiles
create policy "ver mi perfil" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "admin edita perfiles" on public.profiles for update using (public.my_role() = 'admin');

-- programs: público ve publicados (catálogo); staff todo
create policy "catalogo publico" on public.programs for select using (published or public.is_staff() or public.is_enrolled(id));
create policy "staff gestiona programas" on public.programs for all using (public.is_staff()) with check (public.is_staff());

-- modules / lessons: solo matriculados o staff
create policy "ver temas" on public.modules for select using (public.is_staff() or public.is_enrolled(program_id));
create policy "staff gestiona temas" on public.modules for all using (public.is_staff()) with check (public.is_staff());

create policy "ver lecciones" on public.lessons for select using (
  public.is_staff() or public.is_enrolled((select m.program_id from public.modules m where m.id = module_id))
);
create policy "staff gestiona lecciones" on public.lessons for all using (public.is_staff()) with check (public.is_staff());

-- enrollments: alumno ve las suyas; solo admin matricula
create policy "ver mis matriculas" on public.enrollments for select using (user_id = auth.uid() or public.is_staff());
create policy "admin matricula" on public.enrollments for all using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- progreso: cada alumno el suyo
create policy "ver mi progreso" on public.lesson_progress for select using (user_id = auth.uid() or public.is_staff());
create policy "marcar mi progreso" on public.lesson_progress for insert with check (user_id = auth.uid());
create policy "borrar mi progreso" on public.lesson_progress for delete using (user_id = auth.uid());

-- quizzes
create policy "ver quizzes" on public.quizzes for select using (
  public.is_staff() or public.is_enrolled((select m.program_id from public.modules m join public.lessons l on l.module_id = m.id where l.id = lesson_id))
);
create policy "staff gestiona quizzes" on public.quizzes for all using (public.is_staff()) with check (public.is_staff());

create policy "ver preguntas" on public.quiz_questions for select using (
  public.is_staff() or exists (select 1 from public.quizzes q where q.id = quiz_id)
);
create policy "staff gestiona preguntas" on public.quiz_questions for all using (public.is_staff()) with check (public.is_staff());

create policy "ver mis intentos" on public.quiz_attempts for select using (user_id = auth.uid() or public.is_staff());
create policy "registrar mi intento" on public.quiz_attempts for insert with check (user_id = auth.uid());

-- ---------- PRIMER ADMINISTRADOR ----------
-- 1. Crea tu usuario en Authentication -> Users -> Add user (email + password)
-- 2. Luego ejecuta (reemplazando el email):
-- update public.profiles set role = 'admin', full_name = 'Administrador'
--   where id = (select id from auth.users where email = 'info@urologiasur.cl');
