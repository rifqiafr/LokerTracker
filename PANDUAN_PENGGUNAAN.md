# 📋 Panduan Penggunaan & Dokumentasi LOKER (Job Tracker)

**LOKER** adalah aplikasi manajemen pelacak lamaran kerja (*Job Application Tracker*) modern berarsitektur *fullstack* (React + Express + SQLite). Aplikasi ini dirancang khusus untuk mempermudah para pencari kerja mengorganisasi ratusan proses lamaran, persiapan interview, dan penawaran kerja secara terstruktur dan efisien.

---

## 📑 Daftar Isi
1. [Arsitektur & Teknologi](#-arsitektur--teknologi)
2. [Instalasi & Menjalankan Aplikasi](#-instalasi--menjalankan-aplikasi)
3. [Panduan Fitur Utama](#-panduan-fitur-utama)
   - [Papan Kanban Pelacak Lamaran](#1-papan-kanban-pelacak-lamaran)
   - [Automasi Input Cepat (Smart URL & Magic Paste)](#2-automasi-input-cepat-smart-url--magic-paste)
   - [Drawer Detail Lamaran](#3-drawer-detail-lamaran)
   - [Foto Profil Kustom](#4-foto-profil-kustom)
   - [Mode Gelap & Terang (Dark / Light Mode)](#5-mode-gelap--terang-dark--light-mode)
   - [Statistik & Analisis (Analytics)](#6-statistik--analisis-analytics)
   - [Arsip & Cadangan Data](#7-arsip--cadangan-data)
   - [Dukungan Responsif Multi-Device](#8-dukungan-responsif-multi-device)
4. [Struktur Direktori Monorepo](#-struktur-direktori-monorepo)
5. [Daftar Endpoint API Backend](#-daftar-endpoint-api-backend)
6. [Tips & Praktik Terbaik](#-tips--praktik-terbaik)

---

## 🚀 Arsitektur & Teknologi

Aplikasi ini menggunakan konsep **Monorepo** standar *npm workspaces* yang memisahkan aplikasi web dan server backend:

* **Frontend (`apps/web`)**:
  - **Framework**: React 18, TypeScript, Vite 5.
  - **Styling**: Tailwind CSS 3.4 dengan sistem token dinamis (Material Design 3 semantic color tokens via CSS Variables).
  - **Font**: Plus Jakarta Sans (Headings/Body) & Inter (Labels/Data).
  - **Ikon**: Google Material Symbols Outlined.

* **Backend (`apps/api`)**:
  - **Runtime & Server**: Node.js 22, Express 4, TypeScript via `tsx`.
  - **Database & ORM**: SQLite dengan Prisma ORM 5.
  - **Autentikasi**: JWT (JSON Web Token) & enkripsi password dengan `bcryptjs`.
  - **Web Scraper**: Native fetch parser dengan ekstraksi metadata *OpenGraph*, *Twitter Cards*, dan *JSON-LD*.

---

## 💻 Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Pastikan komputer Anda telah terinstal **Node.js** (versi 18 atau yang lebih baru) dan **npm**.

### 2. Memasang Dependensi
Buka terminal/PowerShell di direktori utama proyek (`c:/laragon/www/Loker`):
```bash
npm install
```

### 3. Menyiapkan Database Backend
Masuk ke direktori backend untuk menginisialisasi database SQLite:
```bash
cd apps/api
npm run db:push
npm run db:seed    # (Opsional: mengisi data awal contoh)
cd ../..
```

### 4. Menjalankan Server Development

* **Menjalankan Backend API (Port 5000)**:
  ```bash
  cd apps/api
  npm run dev
  ```
  *Server berjalan di `http://localhost:5000`.*

* **Menjalankan Frontend Web (Port 3000)** (di terminal terpisah):
  ```bash
  cd apps/web
  npm run dev
  ```
  *Buka browser Anda di `http://localhost:3000`.*

---

## 🌟 Panduan Fitur Utama

### 1. Papan Kanban Pelacak Lamaran
Papan Kanban LOKER membagi proses rekrutmen menjadi 5 tahapan utama:
- **Applied**: Lowongan yang baru saja Anda kirimkan berkas lamarannya.
- **Test**: Tahap psikotes, tes teknis (*coding challenge*), atau *take-home assignment*.
- **Interview**: Wawancara bersama HRD, User, atau jajaran manajemen.
- **Offered**: Penawaran kerja resmi (*Offering Letter* / negosiasi kompensasi).
- **Rejected**: Lowongan yang belum berhasil atau ditolak.

> **Tips Interaksi**:
> - **Geser Kartu (*Drag and Drop*)**: Klik dan tahan kartu lamaran, lalu seret ke kolom tahapan baru.
> - **Buka Detail**: Klik kartu lamaran untuk membuka drawer rincian catatan dan jadwal.
> - **Cari Lamaran**: Ketik nama perusahaan atau posisi pada bilah pencarian di bagian atas.

---

### 2. Automasi Input Cepat (Smart URL & Magic Paste)
Fitur ini mengeliminasi kejenuhan menyalin dan menempel data lowongan satu per satu. Saat membuka modal **Tambah Lamaran**, Anda memiliki 2 metode otomatis:

#### A. 🔗 Tarik Data dari Link Lowongan (*Smart URL Extractor*)
1. Salin tautan lowongan dari platform pencari kerja (misal: LinkedIn, Glints, JobStreet, Kalibrr, Dealls, atau web karir perusahaan).
2. Tempelkan URL pada inputan dan klik tombol **"Ekstrak"**.
3. Sistem secara otomatis mendeteksi:
   - **Posisi / Role** (contoh: *Senior Frontend Engineer*)
   - **Nama Perusahaan** (contoh: *PT GoTo Gojek Tokopedia*)
   - **Sistem Kerja** (*Remote* / *Hybrid* / *On-site*)
   - **Lokasi Penempatan** & **Link Pendaftaran**
4. Klik **"Langsung Simpan 🚀"** atau tinjau terlebih dahulu di formulir.

#### B. 📋 Magic Paste (*Pendeteksi Teks Otomatis*)
1. Cocok untuk pesan lowongan yang disalin dari **WhatsApp**, grup **Telegram**, atau postingan *feed* LinkedIn.
2. Tempel seluruh teks panjang ke area **Magic Paste**.
3. Klik **"Ekstrak Teks Otomatis"**. Parser cerdas akan langsung membedah posisi, nama PT/perusahaan, rentang gaji (misal `15 - 25 jt`), serta kualifikasi dalam waktu < 10 milidetik.

---

### 3. Drawer Detail Lamaran
Klik salah satu kartu di papan Kanban untuk memunculkan drawer samping yang menampilkan:
- **Status Tahapan & Label Warna**: Penanda visual status proses lamaran.
- **Ringkasan Kompensasi & Waktu**:
  - Estimasi gaji yang ditawarkan.
  - Sistem kerja (*Remote*, *Hybrid*, atau *On-site*).
  - Tanggal pengajuan lamaran dan jadwal interview terdekat.
- **Catatan Teknis & Interview**: Area catatan bergaya *Notion* berformat Markdown untuk menuliskan kisi-kisi teknis, pertanyaan pewawancara, atau rangkuman evaluasi.
- **Aksi Cepat**: Tombol *Pindah Kolom*, *Hapus Lamaran*, dan *Simpan Perubahan*.

---

### 4. Foto Profil Kustom
Anda dapat memasang foto profil asli Anda sendiri:
1. Buka menu **Pengaturan** (ikon gerigi di sidebar atau klik foto profil di header).
2. Pada tab **Profil Kandidat**, klik foto atau tekan tombol **"Unggah Foto dari Perangkat"**.
3. Pilih gambar dari komputer atau galeri ponsel Anda.
4. Sistem otomatis memotong (*center-crop*) gambar menjadi bujursangkar proporsional dan mengompresinya secara lokal via HTML5 Canvas agar ringan dan tajam.
5. Klik **"Simpan Perubahan Profil"**.

---

### 5. Mode Gelap & Terang (Dark / Light Mode)
- Klik tombol ikon **Bulan / Matahari** di Header untuk beralih antara tema gelap (*Dark Obsidian*) dan tema terang (*Clean Light*).
- Pilihan tema otomatis tersimpan di peramban Anda (`localStorage`) dan tidak akan silau atau berkedip saat halaman dimuat ulang.

---

### 6. Statistik & Analisis (Analytics)
Akses menu **Analytics** di sidebar untuk memantau efektivitas pencarian kerja:
- **Metrik Utama**: Total lamaran aktif, jumlah interview yang berhasil diraih, jumlah penawaran (*offer*), dan persentase tingkat keberhasilan (*Success Rate*).
- **Funnel Konversi**: Visualisasi persentase pelamar dari tahap pendaftaran hingga mencapai penawaran kerja.
- **Preferensi Sistem Kerja**: Distribusi lowongan berdasarkan sistem kerja (*Remote vs Hybrid vs On-site*).

---

### 7. Arsip & Cadangan Data
- **Menu Arsip**: Lowongan yang telah selesai atau ditolak dapat diarsipkan agar papan Kanban tetap bersih. Lamaran di arsip dapat dipulihkan (*Restore*) kapan saja.
- **Ekspor Data (Backup)**: Di menu Pengaturan &rarr; tab **Manajemen Data**, Anda dapat mengekspor seluruh basis data lamaran Anda ke dalam file:
  - **CSV** (dapat dibuka langsung di Microsoft Excel / Google Sheets).
  - **JSON** (arsip data terstruktur).

---

### 8. Dukungan Responsif Multi-Device
Aplikasi LOKER dioptimalkan untuk berjalan di semua resolusi layar:
- **Layar Smartphone (< 640px)**:
  - Sidebar tersimpan rapi dan dapat dibuka melalui menu hamburger (`menu`) di header.
  - Papan Kanban menggunakan sistem *horizontal snap scroll* (bisa digeser ke samping dengan sentuhan jari seperti Trello/Jira Mobile).
  - Modal dan drawer membuka 100% lebar layar agar tombol mudah disentuh.
- **Layar Tablet (640px – 1023px)**: Menampilkan 2 kolom Kanban sekaligus dengan scrolling halus.
- **Layar Desktop (≥ 1024px)**: Sidebar tetap di sisi kiri dan 5 kolom Kanban tampil penuh tanpa horizontal scroll.

---

## 📁 Struktur Direktori Monorepo

```
Loker/
├── package.json               # Root monorepo npm workspaces
├── PANDUAN_PENGGUNAAN.md      # Dokumentasi lengkap panduan aplikasi
├── README.md                  # Ringkasan proyek
├── apps/
│   ├── api/                   # Backend REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Skema model database SQLite (User, Job, Timeline)
│   │   │   └── seed.ts        # Script seed data awal
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts          # Client Prisma Singleton
│   │   │   │   └── urlJobExtractor.ts # Pustaka ekstraksi metadata web/OG
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts            # Middleware verifikasi JWT Bearer
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts     # Register, Login, Me, Update Profile
│   │   │   │   ├── jobs.routes.ts     # CRUD Lowongan & POST /extract-url
│   │   │   │   └── analytics.routes.ts# Endpoint metrik & konversi
│   │   │   └── server.ts              # Entry point Express server
│   │   └── package.json
│   │
│   └── web/                   # Frontend React Single Page Application
│       ├── index.html         # Dokumen HTML utama
│       ├── tailwind.config.js # Konfigurasi tema token dinamis
│       ├── vite.config.ts     # Konfigurasi Vite bundler
│       ├── src/
│       │   ├── assets/        # Logo dan aset visual
│       │   ├── components/
│       │   │   ├── auth/      # Form Login & Register
│       │   │   ├── board/     # KanbanBoard, KanbanColumn, JobCard, FilterBar
│       │   │   ├── drawer/    # JobDetailDrawer
│       │   │   ├── layout/    # Sidebar & Header
│       │   │   ├── modal/     # AddJobModal (Smart URL & Magic Paste)
│       │   │   └── views/     # AnalyticsView, ArchiveView, SettingsView
│       │   ├── services/
│       │   │   └── api.ts     # Klien HTTP fetch ke Backend
│       │   ├── utils/
│       │   │   └── textJobParser.ts # Algoritma parser cerdas Magic Paste
│       │   ├── types/
│       │   │   └── job.ts     # Tipe data TypeScript
│       │   ├── App.tsx        # Komponen root aplikasi & state management
│       │   └── index.css      # Variabel warna CSS (:root & .dark)
│       └── package.json
```

---

## 📡 Daftar Endpoint API Backend

Base URL: `http://localhost:5000/api`

### 1. Autentikasi (`/auth`)
| Metode | Endpoint | Deskripsi | Autentikasi |
|---|---|---|---|
| `POST` | `/auth/register` | Mendaftarkan akun pengguna baru | Publik |
| `POST` | `/auth/login` | Masuk dan mendapatkan JWT token | Publik |
| `GET` | `/auth/me` | Mengambil profil pengguna yang sedang login | Bearer Token |
| `PUT` | `/auth/profile` | Memperbarui nama, foto profil, dan password | Bearer Token |

### 2. Lowongan Pekerjaan (`/jobs`)
| Metode | Endpoint | Deskripsi | Autentikasi |
|---|---|---|---|
| `POST` | `/jobs/extract-url` | Mengekstrak metadata dari link lowongan | Publik |
| `GET` | `/jobs` | Mengambil semua daftar lamaran pengguna | Bearer Token |
| `POST` | `/jobs` | Membuat data lamaran baru | Bearer Token |
| `PUT` | `/jobs/:id` | Memperbarui informasi lamaran | Bearer Token |
| `PATCH`| `/jobs/:id/status`| Memindahkan tahap status lamaran | Bearer Token |
| `PATCH`| `/jobs/:id/archive`| Mengarsipkan / memulihkan lamaran | Bearer Token |
| `DELETE`| `/jobs/:id` | Menghapus lamaran secara permanen | Bearer Token |

### 3. Analitik (`/analytics`)
| Metode | Endpoint | Deskripsi | Autentikasi |
|---|---|---|---|
| `GET` | `/analytics/metrics` | Mengambil ringkasan data metrik & funnel | Bearer Token |

---

## 💡 Tips & Praktik Terbaik

1. **Gunakan Magic Paste untuk Efisiensi**: Saat melihat lowongan di grup WhatsApp atau LinkedIn, langsung blok teks pesan &rarr; salin &rarr; tempelkan di tab *Magic Paste* pada tombol Tambah Lamaran untuk pengisian otomatis dalam 1 klik.
2. **Perbarui Catatan Setelah Sesi Wawancara**: Langsung buka kartu lamaran setelah wawancara dan tuliskan pertanyaan apa saja yang ditanyakan di bagian *Catatan Teknis & Interview* sebagai bahan evaluasi.
3. **Kombinasikan dengan Mode Gelap**: Jika Anda sering melamar kerja di malam hari, aktifkan *Dark Mode* untuk kenyamanan mata.
4. **Rutin Ekspor Data**: Lakukan ekspor CSV secara berkala di menu Pengaturan untuk menyimpan arsip fisik pencarian kerja Anda.

---

*LOKER - Job Tracker © 2026. Dirancang untuk kenyamanan, kecepatan, dan produktivitas pencari kerja.*
