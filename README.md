# SIKOMA — Sistem Informasi Keuangan Mahasiswa

Aplikasi web untuk mahasiswa (terutama anak kos) yang ingin mencatat pemasukan dan pengeluaran harian secara cepat, simpel, dan visual. Dilengkapi autentikasi Supabase, dashboard finansial, kategori, grafik, serta UI modern dengan glassmorphism dan animasi halus.

## Fitur Utama

- Auth (Register/Login) + verifikasi email
- Reset password via email
- Dashboard ringkas: saldo, pemasukan bulan ini, pengeluaran bulan ini, sisa uang
- CRUD transaksi (income/expense)
- Filter transaksi: tipe, kategori, tanggal (hari ini/bulan ini/custom), pencarian
- Grafik: pie (pengeluaran per kategori), bar (pengeluaran harian)
- Kategori terpisah antara income dan expense
- SweetAlert2 custom theme untuk toast dan confirm
- Light/Dark mode
- Responsive, mobile-first

## Teknologi

- Vite + React (JSX)
- TailwindCSS
- Supabase (Auth + Database + RLS)
- SweetAlert2
- Framer Motion
- Recharts

## Struktur Folder

```
CatatKeuangan/
├── public/
│   ├── logo.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── src/
│   ├── components/
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
│   │   ├── alerts.js
│   │   ├── categoryIcons.js
│   │   ├── supabase.js
│   │   └── theme.jsx
│   ├── pages/
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
│   └── styles/
│       └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Alur Aplikasi

1. **Register** dengan email & password.
2. **Verifikasi email** via link yang dikirim Supabase.
3. **Login** menggunakan akun terverifikasi.
4. Masuk ke **Dashboard** untuk melihat ringkasan, grafik, dan daftar transaksi.
5. **Tambah/Edit/Hapus** transaksi.
6. **Reset password** bisa dari dashboard (atau halaman lupa password).

## Setup & Instalasi

### 1) Install Dependencies

```bash
npm install
```

### 2) Buat Project Supabase

- Buat project baru di Supabase.
- Ambil **Project URL** dan **Anon Public Key**.

### 3) Konfigurasi Environment

Buat file `.env` di root:

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

### 4) Konfigurasi Auth Redirect (Supabase)

Di Supabase Dashboard:
- **Authentication → URL Configuration**
- Set:
  - Site URL: `http://localhost:5173`
  - Redirect URLs:
    - `http://localhost:5173/login`
    - `http://localhost:5173/reset-password`

Jika production:
- Ganti ke domain kamu, misalnya:
  - `https://sikoma.vercel.app/login`
  - `https://sikoma.vercel.app/reset-password`

### 5) Jalankan SQL Schema

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


drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

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

-- Seed kategori default (opsional, untuk user yang sudah ada)
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

### 6) Jalankan Project

```bash
npm run dev
```

Akses di `http://localhost:5173`.

## Admin Panel (Super Admin)

Admin panel aman menggunakan **Supabase Edge Functions** (server-side). Hanya email yang ada di allowlist yang bisa mengakses.

### 1) Set Secrets untuk Edge Function

Jalankan via Supabase CLI:

```bash
supabase secrets set SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

Catatan: Supabase **melarang** membuat secret dengan prefix `SUPABASE_`. `SUPABASE_URL` sudah tersedia otomatis di Edge Functions, jadi cukup set `SERVICE_ROLE_KEY` dan `ADMIN_EMAILS`.

### 2) Deploy Functions

```bash
supabase functions deploy admin-users
supabase functions deploy admin-transactions
```

### 3) Akses Admin

Buka `https://your-domain.com/admin` setelah login dengan email admin.

## Kustomisasi Branding / SEO

Ganti domain dan metadata di file berikut jika dibutuhkan:

- `index.html` (title, meta, og tags, canonical)
- `public/robots.txt`
- `public/sitemap.xml`

Logo dan OG image:
- `public/logo.svg`
- `public/og-image.svg`

## Catatan Penting

- Email verifikasi dan reset password akan menggunakan URL redirect yang kamu set di Supabase.
- Default kategori untuk user baru dibuat otomatis oleh aplikasi (juga ada seed opsional di SQL).
- Jika ingin menambah kategori icon, edit di `src/lib/categoryIcons.js`.

## Scripts

- `npm run dev` — development
- `npm run build` — build production
- `npm run preview` — preview build

## License

Open-source untuk kebutuhan belajar dan pengembangan.
