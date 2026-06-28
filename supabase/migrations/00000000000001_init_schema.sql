-- ============================================================
-- HORIZON ZENITH — INICIALIZACIÓN DEL ESQUEMA (v1.1)
-- PostgreSQL 15 / Supabase
-- ============================================================
-- Cambios respecto al documento base (v1.0.0):
--   1. Se corrige la inconsistencia de ortografía en el estado
--      'Listo para Correccion' (sin acento, consistente en toda la BD).
--   2. RLS endurecida: los alumnos ya NO pueden escribir libremente
--      sobre sus propios datos críticos. Antes, un alumno podía:
--        - Aprobarse su propio desafío (status = 'Aprobado').
--        - Responderse su propia consulta (answer / is_resolved).
--        - Modificar su propio status/program_type/github_repo.
--      Esto se corrige separando políticas por operación (SELECT vs
--      INSERT vs UPDATE) y agregando un trigger de máquina de estados
--      para 'challenges'. Las operaciones administrativas (mentor)
--      se hacen con la service_role key desde el backend/Edge
--      Functions, que de por sí ignora RLS.
-- ============================================================

-- PASO 1: Tablas
-- ------------------------------------------------------------

create table public.profiles (
  id            uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  role          text        not null,
  status        text        not null default 'Activo'
                            check (status in ('Activo', 'Pausado', 'Finalizado')),
  program_type  text        not null
                            check (program_type in ('Carrera Completa', 'Clase Particular Express')),
  objective     text        not null,
  meet_link     text,
  github_repo   text,
  created_at    timestamptz not null default now(),
  constraint profiles_pkey primary key (id)
);

create table public.classes (
  id            serial      not null,
  student_id    uuid        not null references public.profiles(id) on delete cascade,
  class_number  int         not null check (class_number > 0),
  title         text        not null,
  date          text        not null,
  duration      text        not null,
  description   text        not null,
  video_url     text        not null,
  constraint classes_pkey primary key (id),
  constraint classes_student_number_unique unique (student_id, class_number)
);

create table public.challenges (
  id            serial      not null,
  student_id    uuid        not null references public.profiles(id) on delete cascade,
  title         text        not null,
  description   text        not null,
  status        text        not null default 'Pendiente'
                            check (status in (
                              'Pendiente',
                              'En Progreso',
                              'Listo para Correccion',
                              'Aprobado'
                            )),
  updated_at    timestamptz not null default now(),
  constraint challenges_pkey primary key (id)
);

create table public.code_history (
  id            serial      not null,
  class_id      int         not null references public.classes(id) on delete cascade,
  file_name     text        not null,
  description   text        not null,
  code_content  text        not null,
  constraint code_history_pkey primary key (id)
);

create table public.doubts (
  id            serial      not null,
  student_id    uuid        not null references public.profiles(id) on delete cascade,
  question      text        not null,
  answer        text,
  is_resolved   boolean     not null default false,
  created_at    timestamptz not null default now(),
  constraint doubts_pkey primary key (id)
);

-- PASO 2: Triggers
-- ------------------------------------------------------------

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger challenges_updated_at_trigger
  before update on public.challenges
  for each row execute function update_updated_at_column();

-- Trigger de máquina de estados para 'challenges'. El backend con
-- service_role (mentor) puede hacer cualquier transición. Un alumno
-- autenticado normal sólo puede mover su propio desafío hacia
-- 'Listo para Correccion' desde 'Pendiente' o 'En Progreso', o
-- moverlo a 'En Progreso' desde 'Pendiente'. NUNCA puede auto-aprobarse
-- ni retroceder un desafío ya aprobado.
create or replace function enforce_challenge_transition()
returns trigger as $$
begin
  -- service_role (usado por el backend/mentor) puede hacer cualquier cambio
  if auth.role() = 'service_role' then
    return new;
  end if;

  if old.status = new.status then
    return new; -- sin cambio de estado, permitido (ej: no debería pasar, pero no rompe nada)
  end if;

  if old.status = 'Pendiente' and new.status in ('En Progreso', 'Listo para Correccion') then
    return new;
  end if;

  if old.status = 'En Progreso' and new.status = 'Listo para Correccion' then
    return new;
  end if;

  raise exception 'Transición de estado no permitida para un alumno: % -> %', old.status, new.status;
end;
$$ language plpgsql security definer;

create trigger challenges_transition_guard
  before update on public.challenges
  for each row execute function enforce_challenge_transition();

-- PASO 3: Row Level Security
-- ------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.classes      enable row level security;
alter table public.challenges   enable row level security;
alter table public.code_history enable row level security;
alter table public.doubts       enable row level security;

-- profiles: el alumno SOLO puede leer su propio perfil. Todo lo
-- demás (status, github_repo, meet_link, program_type) lo gestiona
-- el mentor vía service_role (consola admin / webhooks de Stripe/GitHub).
create policy "alumno_lee_propio_perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- classes: solo lectura para el alumno dueño. Las clases las crea el mentor.
create policy "alumno_lee_propias_clases"
  on public.classes for select
  to authenticated
  using (auth.uid() = student_id);

-- challenges: el alumno lee sus propios desafíos y puede actualizar
-- el status (sujeto al trigger de transición de arriba). No puede
-- insertar ni borrar desafíos: eso es responsabilidad del mentor.
create policy "alumno_lee_propios_desafios"
  on public.challenges for select
  to authenticated
  using (auth.uid() = student_id);

create policy "alumno_actualiza_status_desafio"
  on public.challenges for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- code_history: solo lectura, vía pertenencia transitiva a través de classes.
create policy "alumno_lee_codigo_via_propiedad_clase"
  on public.code_history for select
  to authenticated
  using (
    exists (
      select 1 from public.classes
      where public.classes.id = code_history.class_id
        and public.classes.student_id = auth.uid()
    )
  );

-- doubts: el alumno puede crear consultas y leer su propio historial,
-- pero NO puede escribir su propia respuesta ni marcarse como resuelto
-- (eso es del mentor, vía service_role).
create policy "alumno_lee_propias_consultas"
  on public.doubts for select
  to authenticated
  using (auth.uid() = student_id);

create policy "alumno_crea_consulta"
  on public.doubts for insert
  to authenticated
  with check (auth.uid() = student_id and answer is null and is_resolved = false);

-- PASO 4: Índices de rendimiento
-- ------------------------------------------------------------

create index idx_classes_student_id      on public.classes(student_id);
create index idx_challenges_student_id   on public.challenges(student_id);
create index idx_challenges_status       on public.challenges(status);
create index idx_code_history_class_id   on public.code_history(class_id);
create index idx_doubts_student_resolved on public.doubts(student_id, is_resolved);

-- ============================================================
-- Fin de la inicialización del esquema.
-- ============================================================
