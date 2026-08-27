-- Inquiries table for /api/inquiry (v1). Run once in the Supabase SQL editor.
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company text not null,
  name text not null,
  email text not null,
  spot text,
  message text,
  invoice boolean not null default false,
  handled boolean not null default false
);
alter table public.inquiries enable row level security;
-- No public policies: only the service role key (server) can read or write.
