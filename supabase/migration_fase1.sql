-- ============================================================
-- Migración Fase 1: seguridad de quizzes, certificados,
-- perfil profesional. Ejecutar DESPUÉS de las migraciones previas.
-- ============================================================

-- ---------- 1. PERFIL PROFESIONAL ----------
alter table public.profiles
  add column if not exists specialty text not null default '',
  add column if not exists institution text not null default '',
  add column if not exists country text not null default '';

-- ---------- 2. SEGURIDAD DE QUIZZES ----------
-- Las respuestas correctas se mueven a una tabla que los alumnos
-- NO pueden leer. La corrección ocurre en el servidor.

create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_index int not null
);

insert into public.quiz_answer_keys (question_id, correct_index)
select id, correct_index from public.quiz_questions;

alter table public.quiz_questions drop column correct_index;

alter table public.quiz_answer_keys enable row level security;
create policy "solo staff ve respuestas" on public.quiz_answer_keys
  for select using (public.is_staff());
create policy "staff gestiona respuestas" on public.quiz_answer_keys
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- 3. CERTIFICADOS ----------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                  -- código de verificación pública
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  avg_score int,                              -- promedio de quizzes al emitir
  issued_at timestamptz not null default now(),
  unique (user_id, program_id)
);

alter table public.certificates enable row level security;
create policy "ver mis certificados" on public.certificates
  for select using (user_id = auth.uid() or public.is_staff());
-- La emisión y la verificación pública ocurren vía API con service role.

-- ---------- 4. AUTO-EDICIÓN DE PERFIL (sin poder cambiarse el rol) ----------
create policy "editar mi perfil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.prevent_role_self_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and (select role from public.profiles where id = auth.uid()) is distinct from 'admin' then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end; $$;

create trigger guard_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();
