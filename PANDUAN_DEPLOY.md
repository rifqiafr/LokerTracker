# 🚀 Panduan Deploy Gratis LOKER Tracker

Panduan ini memandu Anda mendeploy aplikasi **LokerTracker** secara **100% GRATIS** ke internet.

---

## ⚡ Bagian 1: Deploy Frontend ke Vercel (Selesai dalam 2 Menit)

Frontend dibuat dengan React + Vite dan memiliki sistem penyimpanan data lokal (*LocalStorage* bawaan), sehingga Anda bisa langsung mendeploynya ke Vercel dan langsung menggunakannya.

### Langkah-langkah:

1. **Buka Vercel**:
   - Kunjungi [vercel.com](https://vercel.com) dan login menggunakan akun **GitHub** Anda.

2. **Import Repository**:
   - Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
   - Cari repository **`LokerTracker`** (atau `rifqiafr/LokerTracker`), lalu klik tombol **"Import"**.

3. **Konfigurasi Project Settings (PENTING)**:
   - Cari opsi **"Root Directory"**, klik tombol **"Edit"** di sampingnya.
   - Pilih folder **`apps/web`**, lalu klik **"Continue"**.
   - Pastikan pengaturan terdeteksi:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build` (atau otomatis)
     - **Output Directory**: `dist`

4. **Klik Deploy**:
   - Klik tombol biru **"Deploy"**.
   - Tunggu sekitar 30 - 60 detik hingga proses build selesai.
   - 🎉 **Selamat!** Web LokerTracker Anda sudah resmi aktif di internet dengan URL gratis seperti:
     `https://lokertracker.vercel.app`

---

## 🌐 Bagian 2: Menghubungkan Backend & Database Cloud (Opsional / Fullstack)

Jika Anda ingin mengaktifkan fitur multi-user login, sinkronisasi data antar perangkat (HP & PC), serta scraper link lowongan otomatis:

### 1. Buat Database PostgreSQL Gratis (Supabase / Neon)
1. Buka [Supabase.com](https://supabase.com) atau [Neon.tech](https://neon.tech), lalu buat akun gratis.
2. Buat project baru (misal diberi nama `loker-db`).
3. Salin **Connection String (URI)** database Anda. Formatnya:
   ```env
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 2. Update Skema Prisma
Di file `apps/api/prisma/schema.prisma`, ubah bagian datasource menjadi:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Lalu jalankan push skema:
```bash
npm --workspace=apps/api run db:push
```

### 3. Deploy Backend ke Render.com (Gratis)
1. Buka [Render.com](https://render.com) dan login dengan GitHub.
2. Klik **"New +"** $\rightarrow$ **"Web Service"**.
3. Pilih repository `LokerTracker`.
4. Atur konfigurasinya:
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Tambahkan **Environment Variables** di Render:
   - `DATABASE_URL`: *(Connection string dari Supabase/Neon)*
   - `JWT_SECRET`: *(Teks acak panjang untuk enkripsi)*
   - `CLIENT_ORIGIN`: *(URL Vercel Anda, misal `https://lokertracker.vercel.app`)*
6. Klik **"Create Web Service"**. Render akan memberikan URL API publik, contoh: `https://loker-api.onrender.com`.

### 4. Sambungkan Frontend Vercel ke API Render
1. Buka dashboard Vercel Anda $\rightarrow$ masuk ke project `LokerTracker`.
2. Masuk ke tab **Settings** $\rightarrow$ **Environment Variables**.
3. Tambahkan variabel baru:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://loker-api.onrender.com/api` *(sesuaikan dengan URL Render Anda)*
4. Masuk ke tab **Deployments** $\rightarrow$ klik titik tiga `...` pada deployment terakhir $\rightarrow$ pilih **"Redeploy"**.
5. Semua fitur (Login, Database Server, Smart URL) kini aktif 100% secara fullstack!
