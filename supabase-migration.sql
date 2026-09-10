-- DataEscuela: roles y perfiles de usuario.
-- Ejecutar en Supabase SQL Editor o con el cliente PostgreSQL autenticado.
create extension if not exists pgcrypto;

create table if not exists public.roles (
  uuid uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  uuid uuid primary key references auth.users(id) on delete cascade,
  role_uuid uuid not null references public.roles(uuid),
  email text not null unique,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (slug, name) values
  ('escuela', 'Escuela'),
  ('inspector', 'Inspector'),
  ('jefatura', 'Jefatura'),
  ('admin', 'Administrador')
on conflict (slug) do update set name = excluded.name, is_active = true;

alter table public.roles enable row level security;
alter table public.users enable row level security;

drop policy if exists "authenticated can read active roles" on public.roles;
create policy "authenticated can read active roles"
on public.roles for select to authenticated
using (is_active = true);

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile"
on public.users for select to authenticated
using (uuid = auth.uid());

-- Luego de crear el usuario en Authentication > Users, ejecutá esto,
-- reemplazando el correo y el nombre si fuera necesario:
-- insert into public.users (uuid, role_uuid, email, full_name)
-- select au.id, r.uuid, au.email, 'Administrador'
-- from auth.users au cross join public.roles r
-- where au.email = 'nudos.j3@gmail.com' and r.slug = 'admin'
-- on conflict (uuid) do update set role_uuid = excluded.role_uuid,
-- full_name = excluded.full_name, is_active = true;
