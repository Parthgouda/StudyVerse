# StudyVerse

A React + TypeScript + Vite educational resource platform for Class 11 and 12, with a dark purple design and Supabase integration points.

## Included
- Responsive homepage and stream/class/subject browsing
- Search and filters for published notes
- Supabase Auth login/register/logout
- Favorites for authenticated users
- Admin-only dashboard routes (role checked against `user_roles`)
- PDF upload to a private Storage bucket and note metadata records
- Contact form backed by PostgreSQL
- SQL migration with tables, indexes, RLS policies and Storage policies
- `.env.example`; no credentials included

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- A Supabase project

## Run locally
1. Extract the ZIP and open a terminal in the project folder.
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your Supabase Project URL and publishable/anon key.
4. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
5. In Supabase Storage, create a **private** bucket named `study-pdfs` (or use the SQL Storage policies included in the migration).
6. Start:
   ```bash
   npm run dev
   ```
7. Build check:
   ```bash
   npm run build
   ```

## Provision the first admin
Do not create a public admin registration flow. First register a normal account using the app. Copy its Auth user UUID from Supabase → Authentication → Users. Then, in the SQL Editor, run the following after replacing the UUID:
```sql
insert into public.user_roles (user_id, role)
values ('REPLACE-WITH-AUTH-USER-UUID', 'admin')
on conflict (user_id) do update set role = 'admin';
```
Keep this action restricted to a trusted project owner. Revoke admin access by deleting the user's `user_roles` row or changing role to `student`.

## Important security notes
- Only the Supabase publishable/anon key belongs in the frontend; it is designed to be public when RLS is correct.
- Never add service-role credentials to this project or commit `.env.local`.
- RLS policies are the real security boundary. Frontend route guards are only a user-experience layer.
- The contact form has client validation; add edge-function/server-side rate limiting or CAPTCHA before exposing it to heavy public traffic.
- Private PDF downloads use short-lived signed URLs after fetching published metadata.
- This scaffold needs your Supabase credentials and SQL migration to be functional with real data. No hosted service has been configured automatically.

## Deploy
- Push the repository to GitHub.
- Import it in Vercel.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project environment variables.
- Deploy. For client-side routing, Vercel's Vite preset normally handles SPA fallback; if needed add a rewrite from `/(.*)` to `/`.

## Folder structure
```
src/
  components/       Shared navigation, cards, layout
  contexts/         Auth context
  lib/              Supabase client
  pages/            Public, auth and admin pages
  services/         Notes and contact operations
  types/            Shared types
supabase/
  migrations/       Database schema and RLS/storage policies
```
