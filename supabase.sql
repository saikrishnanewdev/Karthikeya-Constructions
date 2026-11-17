-- Run in Supabase SQL editor
create table projects (
  id bigserial primary key,
  title text not null,
  category text,
  year int,
  status text default 'ongoing',
  image text
);
create table services (
  id bigserial primary key,
  title text,
  description text
);
create table testimonials (
  id bigserial primary key,
  name text,
  text text
);
create table inquiries (
  id bigserial primary key,
  name text,
  email text,
  phone text,
  message text,
  created_at timestamptz default now()
);
-- Enable RLS
alter table projects enable row level security;
alter table services enable row level security;
alter table testimonials enable row level security;
alter table inquiries enable row level security;
-- Public read
create policy "public read projects" on projects for select using (true);
create policy "public read services" on services for select using (true);
create policy "public read testimonials" on testimonials for select using (true);
-- Public insert inquiries
create policy "public insert inquiries" on inquiries for insert with check (true);
-- For demo, allow anon full access to projects (replace with auth in production)
create policy "anon all projects" on projects for all using (true) with check (true);