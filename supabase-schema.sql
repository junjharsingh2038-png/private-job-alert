-- Run this SQL in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  hr_user_id uuid not null references auth.users(id) on delete cascade,
  hr_email text not null,
  title text not null,
  company text not null,
  location text,
  qualification text,
  salary text,
  job_type text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  hr_email text not null,
  candidate_name text not null,
  candidate_mobile text not null,
  candidate_email text not null,
  candidate_location text,
  qualification text,
  experience text,
  resume_path text,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Public can read active jobs" on public.jobs;
create policy "Public can read active jobs" on public.jobs for select using (is_active = true);

drop policy if exists "HR can insert own jobs" on public.jobs;
create policy "HR can insert own jobs" on public.jobs for insert to authenticated with check (hr_user_id = auth.uid() and hr_email = auth.jwt()->>'email');

drop policy if exists "HR can manage own jobs" on public.jobs;
create policy "HR can manage own jobs" on public.jobs for delete to authenticated using (hr_user_id = auth.uid());

drop policy if exists "Public can submit applications" on public.applications;
create policy "Public can submit applications" on public.applications for insert to anon,authenticated with check (true);

drop policy if exists "HR can read own applications" on public.applications;
create policy "HR can read own applications" on public.applications for select to authenticated using (hr_email = auth.jwt()->>'email');

insert into storage.buckets (id,name,public) values ('resumes','resumes',false)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload resume" on storage.objects;
create policy "Anyone can upload resume" on storage.objects for insert to anon,authenticated
with check (bucket_id='resumes');

drop policy if exists "HR can read resumes" on storage.objects;
create policy "HR can read resumes" on storage.objects for select to authenticated
using (bucket_id='resumes');
