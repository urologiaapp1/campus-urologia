-- ============================================================
-- Migración: Tópicos comunitarios (subtemas creados por usuarios,
-- con comentarios y calificaciones)
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor de Supabase.
-- ============================================================

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  drive_file_id text,          -- adjunto opcional (video/documento en Drive del autor)
  drive_kind text check (drive_kind in ('video','documento')),
  created_at timestamptz not null default now()
);

create table public.topic_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.topic_ratings (
  topic_id uuid not null references public.topics(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

-- Los usuarios autenticados pueden ver nombres de otros (para autoría de tópicos)
drop policy if exists "ver mi perfil" on public.profiles;
create policy "ver perfiles" on public.profiles
  for select using (auth.uid() is not null);

-- helper: ¿puedo participar en este módulo? (staff o matriculado en su programa)
create or replace function public.can_access_module(p_module uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff() or public.is_enrolled(
    (select program_id from public.modules where id = p_module)
  )
$$;

alter table public.topics enable row level security;
alter table public.topic_comments enable row level security;
alter table public.topic_ratings enable row level security;

-- topics: ver y crear cualquiera con acceso al módulo; editar/borrar el autor o admin
create policy "ver topicos" on public.topics
  for select using (public.can_access_module(module_id));
create policy "crear topicos" on public.topics
  for insert with check (author_id = auth.uid() and public.can_access_module(module_id));
create policy "editar mi topico" on public.topics
  for update using (author_id = auth.uid() or public.my_role() = 'admin');
create policy "borrar mi topico" on public.topics
  for delete using (author_id = auth.uid() or public.my_role() = 'admin');

-- comentarios
create policy "ver comentarios" on public.topic_comments
  for select using (public.can_access_module((select module_id from public.topics where id = topic_id)));
create policy "comentar" on public.topic_comments
  for insert with check (author_id = auth.uid() and public.can_access_module((select module_id from public.topics where id = topic_id)));
create policy "borrar mi comentario" on public.topic_comments
  for delete using (author_id = auth.uid() or public.my_role() = 'admin');

-- calificaciones (1 a 5 estrellas, una por usuario, editable)
create policy "ver calificaciones" on public.topic_ratings
  for select using (public.can_access_module((select module_id from public.topics where id = topic_id)));
create policy "calificar" on public.topic_ratings
  for insert with check (user_id = auth.uid() and public.can_access_module((select module_id from public.topics where id = topic_id)));
create policy "cambiar mi calificacion" on public.topic_ratings
  for update using (user_id = auth.uid());
create policy "quitar mi calificacion" on public.topic_ratings
  for delete using (user_id = auth.uid());
