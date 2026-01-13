# SIKOMA - Sistem Informasi Keuangan Mahasiswa

SIKOMA adalah web app untuk mahasiswa yang ingin mencatat pemasukan dan pengeluaran harian secara cepat, rapi, dan visual. Dilengkapi autentikasi Supabase, dashboard finansial, rekap mingguan/bulanan, export laporan, dan admin panel aman.

## Fitur Utama

- Auth: Register/Login + verifikasi email
- Reset password via email
- Dashboard keuangan: saldo, pemasukan bulan ini, pengeluaran bulan ini, sisa uang
- CRUD transaksi (income/expense)
- Filter transaksi: tipe, kategori, tanggal (hari ini/bulan ini/custom), pencarian
- Rekap mingguan/bulanan (mengikuti filter aktif)
- Export laporan ke .xlsx dan .pdf
- Grafik: pie (pengeluaran per kategori), bar (pengeluaran harian)
- Kategori terpisah antara income dan expense
- SweetAlert2 custom theme
- Light/Dark mode
- Admin panel: daftar user + semua transaksi (pagination user)

## Teknologi

- Vite + React (JSX)
- TailwindCSS
- Supabase (Auth + Database + RLS + Edge Functions)
- SweetAlert2
- Framer Motion
- Recharts
- xlsx, jsPDF

## Struktur Folder (ringkas)

```
CatatKeuangan/
├── public/
│   ├── logo.svg
│   ├── logo.png
│   ├── og-image.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts
│       ├── admin-users/
│       │   └── index.ts
│       └── admin-transactions/
│           └── index.ts
├── src/
│   ├── components/
│   │   ├── AdminRoute.jsx
│   │   ├── CategoryModal.jsx
│   │   ├── Charts.jsx
│   │   ├── DashboardSkeleton.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Stats.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── TransactionFormModal.jsx
│   │   ├── TransactionItem.jsx
│   │   └── TransactionSkeleton.jsx
│   ├── lib/
│   │   ├── admin.js
│   │   ├── alerts.js
│   │   ├── categoryIcons.js
│   │   ├── supabase.js
│   │   └── theme.jsx
│   ├── pages/
│   │   ├── Admin.jsx
│   │   ├── App.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── RegisterSuccess.jsx
│   │   └── ResetPassword.jsx
│   ├── App.jsx
│   ├── AppRouter.jsx
│   ├── index.css
│   ├── main.jsx
│   └── styles/index.css
├── index.html
├── package.json
└── vite.config.js
```

## Alur Aplikasi

1. User register dengan email & password.
2. User verifikasi email dari inbox.
3. User login dan masuk ke dashboard.
4. User menambah, mengedit, dan menghapus transaksi.
5. User melihat rekap mingguan/bulanan dan export laporan.
6. Admin (super admin) dapat melihat user + transaksi semua user.

## Setup & Instalasi

### 1) Install dependencies

```bash
npm install
```

### 2) Konfigurasi environment (frontend)

Buat file `.env` di root:

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

### 3) Supabase - Pengaturan Auth

Di Supabase Dashboard:

**Authentication -> URL Configuration**
- Site URL: `http://localhost:5173`
- Redirect URLs:
  - `http://localhost:5173/login`
  - `http://localhost:5173/reset-password`

Jika production, ganti ke domain kamu:
- `https://sikoma.vercel.app/login`
- `https://sikoma.vercel.app/reset-password`

### 4) Supabase - SQL Schema + RLS

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#94a3b8',
  icon text not null default 'Tag',
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null,
  category_id uuid not null references public.categories (id),
  description text not null,
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_date_idx on public.transactions (transaction_date);
create index if not exists transactions_type_idx on public.transactions (type);
create index if not exists categories_user_id_idx on public.categories (user_id);

-- RLS
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "categories_select_own" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = auth.uid()
    )
  );

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = auth.uid()
    )
  );

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Seed kategori default (opsional)
insert into public.categories (user_id, name, type, color, icon)
select u.id, 'Ngopi', 'expense', '#facc15', 'Coffee'
from auth.users u
left join public.categories c
  on c.user_id = u.id and c.name = 'Ngopi' and c.type = 'expense'
where c.id is null;

insert into public.categories (user_id, name, type, color, icon)
select u.id, 'Belanja', 'expense', '#fb7185', 'ShoppingBag'
from auth.users u
left join public.categories c
  on c.user_id = u.id and c.name = 'Belanja' and c.type = 'expense'
where c.id is null;

insert into public.categories (user_id, name, type, color, icon)
select u.id, 'Ngopi', 'income', '#facc15', 'Coffee'
from auth.users u
left join public.categories c
  on c.user_id = u.id and c.name = 'Ngopi' and c.type = 'income'
where c.id is null;

insert into public.categories (user_id, name, type, color, icon)
select u.id, 'Belanja', 'income', '#fb7185', 'ShoppingBag'
from auth.users u
left join public.categories c
  on c.user_id = u.id and c.name = 'Belanja' and c.type = 'income'
where c.id is null;
```

### 5) Jalankan project

```bash
npm run dev
```

Akses di `http://localhost:5173`.

## Admin Panel (Super Admin)

Admin panel menggunakan **Supabase Edge Functions** dan allowlist email admin.

### A) Set secrets untuk Edge Functions

Supabase Dashboard -> Edge Functions -> Secrets:

```
SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

Catatan: Supabase melarang secret dengan prefix `SUPABASE_`. `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sudah disediakan otomatis oleh platform.

### B) Deploy Edge Functions

Opsi 1 (CLI, butuh Docker):
```bash
supabase functions deploy admin-users
supabase functions deploy admin-transactions
```

Opsi 2 (Dashboard):
- Buat function baru: `admin-users`, `admin-transactions`.
- Paste kode dari `supabase/functions/*`.
- Jika deploy lewat Dashboard, pastikan import `_shared/cors.ts` disatukan (inline) atau gunakan versi single-file.

### C) Nonaktifkan Verify JWT

Di Supabase Dashboard -> Edge Functions -> Settings:
- Disable **Verify JWT** untuk `admin-users` dan `admin-transactions`.
- Verifikasi tetap dilakukan di kode (getUser + allowlist email).

### D) Akses admin

Login dengan email admin, buka:
```
https://sikoma.vercek.app/admin
```

## Kustomisasi Branding / SEO

- `index.html` (title, meta, og tags, canonical)
- `public/robots.txt`
- `public/sitemap.xml`
- Logo dan OG image: `public/logo.svg`, `public/logo.png`, `public/og-image.svg`

## Catatan Penting

- Pastikan `.env` tidak di-commit ke git.
- Jika admin panel tidak muncul di production, set `VITE_ADMIN_EMAILS` di Vercel/hosting env lalu redeploy.
- Export laporan menggunakan `xlsx` dan `jsPDF`.

## Scripts

- `npm run dev` - development
- `npm run build` - build production
- `npm run preview` - preview build

## License

Open-source untuk kebutuhan belajar dan pengembangan.
