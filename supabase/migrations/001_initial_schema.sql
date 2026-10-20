-- StudyVerse initial schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  class_number integer not null unique check (class_number in (11,12))
);
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  stream_id uuid not null references public.streams(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, stream_id, class_id),
  unique (slug, stream_id, class_id)
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  stream_id uuid not null references public.streams(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  chapter text,
  topic text,
  resource_type text not null default 'Chapter Notes',
  board text,
  storage_path text not null unique,
  thumbnail_path text,
  file_size bigint check (file_size is null or file_size > 0),
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  status text not null default 'draft' check (status in ('draft','published')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,note_id)
);
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  note_id uuid not null references public.notes(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  subject text not null check (char_length(subject) between 3 and 200),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new','read','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists notes_status_published_idx on public.notes(status,published_at desc);
create index if not exists notes_stream_class_subject_idx on public.notes(stream_id,class_id,subject_id);
create index if not exists subjects_stream_class_idx on public.subjects(stream_id,class_id,is_active);
create index if not exists contact_messages_status_idx on public.contact_messages(status,created_at desc);

-- Automatically create a student profile and role on signup. Role is not read from user metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''))
  on conflict (id) do nothing;
  insert into public.user_roles(user_id, role) values (new.id,'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'); $$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.streams enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.notes enable row level security;
alter table public.favorites enable row level security;
alter table public.downloads enable row level security;
alter table public.contact_messages enable row level security;

create policy "profiles select own or admin" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy "roles select own or admin" on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_admin());
-- No client insert/update/delete policies for roles. Provision admins through trusted SQL.
create policy "streams public read" on public.streams for select to anon, authenticated using (true);
create policy "classes public read" on public.classes for select to anon, authenticated using (true);
create policy "subjects active public read" on public.subjects for select to anon, authenticated using (is_active or public.is_admin());
create policy "subjects admin manage" on public.subjects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "published notes public read" on public.notes for select to anon, authenticated using (status='published' or public.is_admin());
create policy "admin insert notes" on public.notes for insert to authenticated with check (public.is_admin());
create policy "admin update notes" on public.notes for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete notes" on public.notes for delete to authenticated using (public.is_admin());
create policy "favorites own select" on public.favorites for select to authenticated using (user_id=auth.uid());
create policy "favorites own insert" on public.favorites for insert to authenticated with check (user_id=auth.uid());
create policy "favorites own delete" on public.favorites for delete to authenticated using (user_id=auth.uid());
create policy "downloads own select" on public.downloads for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy "users can log own downloads" on public.downloads for insert to authenticated with check (user_id=auth.uid());
create policy "anonymous download tracking insert" on public.downloads for insert to anon with check (user_id is null);
create policy "contact message public insert" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin manage contact messages" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed reference data. Subjects are configurable; adjust to match your curriculum.
insert into public.streams(name,slug) values
 ('Science','science'),('Commerce','commerce'),('Arts / Humanities','arts-humanities')
on conflict do nothing;
insert into public.classes(class_number) values (11),(12) on conflict do nothing;

insert into public.subjects(name,slug,stream_id,class_id)
select v.name, v.slug, s.id, c.id
from (values
 ('Physics','physics','Science'),('Chemistry','chemistry','Science'),('Mathematics','mathematics','Science'),('Biology','biology','Science'),('Computer Science','computer-science','Science'),('English','english','Science'),
 ('Accountancy','accountancy','Commerce'),('Business Studies','business-studies','Commerce'),('Economics','economics','Commerce'),('Mathematics','mathematics','Commerce'),('Applied Mathematics','applied-mathematics','Commerce'),('English','english','Commerce'),('Entrepreneurship','entrepreneurship','Commerce'),
 ('History','history','Arts / Humanities'),('Political Science','political-science','Arts / Humanities'),('Geography','geography','Arts / Humanities'),('Sociology','sociology','Arts / Humanities'),('Psychology','psychology','Arts / Humanities'),('Economics','economics','Arts / Humanities'),('English','english','Arts / Humanities'),('Hindi','hindi','Arts / Humanities')
) as v(name,slug,stream_name)
cross join public.classes c join public.streams s on s.name=v.stream_name
on conflict do nothing;

-- Private PDF bucket. Supabase storage policies are enforced separately.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('study-pdfs','study-pdfs',false,20971520,array['application/pdf'])
on conflict (id) do update set public=false, file_size_limit=20971520, allowed_mime_types=array['application/pdf'];

create policy "published PDF read via signed URL" on storage.objects for select to anon, authenticated using (
  bucket_id='study-pdfs' and (public.is_admin() or exists (
    select 1 from public.notes n where n.storage_path=name and n.status='published'
  ))
);
create policy "admin upload PDFs" on storage.objects for insert to authenticated with check (bucket_id='study-pdfs' and public.is_admin());
create policy "admin update PDFs" on storage.objects for update to authenticated using (bucket_id='study-pdfs' and public.is_admin()) with check (bucket_id='study-pdfs' and public.is_admin());
create policy "admin delete PDFs" on storage.objects for delete to authenticated using (bucket_id='study-pdfs' and public.is_admin());
