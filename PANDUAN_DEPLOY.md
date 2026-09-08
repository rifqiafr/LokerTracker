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

## 🌐 Bagian 2: Deploy Backend ke Vercel (100% di Vercel, Tanpa Akun Tambahan)

Backend Express sekarang sudah siap berjalan sebagai **Vercel Serverless Function**. Anda tidak perlu mendaftar ke platform lain!

### 1. Buat Project Baru di Vercel untuk API:
1. Buka dashboard [vercel.com](https://vercel.com).
2. Klik tombol **"Add New..."** $\rightarrow$ pilih **"Project"**.
3. Pilih repository yang sama: **`LokerTracker`** $\rightarrow$ klik **"Import"**.
4. Beri **Project Name**: `lokertracker-api`
5. Pada bagian **"Root Directory"**, klik **"Edit"** $\rightarrow$ pilih folder **`apps/api`** $\rightarrow$ klik **"Continue"**.
6. Buka bagian **"Environment Variables"**, masukkan 2 variabel berikut:
   - **Key 1**: `DATABASE_URL`
     - **Value**: `postgresql://neondb_owner:npg_Vt0Qln6JwsRd@ep-sparkling-rice-az7j75yi-pooler.c-3.ap-southeast-1.aws.neon.tech/loker-db?sslmode=require`
   - **Key 2**: `JWT_SECRET`
     - **Value**: `loker_rahasia_jwt_super_aman_2026`
7. Klik tombol biru **"Deploy"**!
8. Dalam ~30 detik, API Anda sudah aktif dengan URL seperti:
   `https://lokertracker-api.vercel.app`

---

### 2. Hubungkan Frontend ke Backend API:
1. Buka project **Frontend** Anda di Vercel (project pertama).
2. Masuk ke menu **Settings** $\rightarrow$ **Environment Variables**.
3. Tambahkan variabel:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://lokertracker-api.vercel.app/api` *(ganti dengan URL API Vercel Anda, tambahkan `/api` di ujungnya)*
4. Masuk ke tab **Deployments** $\rightarrow$ klik titik tiga `...` di deployment teratas $\rightarrow$ pilih **"Redeploy"**.
5. Selesai! Register akun baru dan Login sekarang berfungsi 100%!

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
