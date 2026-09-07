# LOKER - Job Tracker Monorepo

> 📖 **Dokumentasi Lengkap & Panduan Penggunaan**: Silakan baca **[PANDUAN_PENGGUNAAN.md](file:///c:/laragon/www/Loker/PANDUAN_PENGGUNAAN.md)** untuk panduan instalasi, fitur, dan arsitektur lengkap dalam Bahasa Indonesia.

A modern, high-performance job application tracking platform built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Express + SQLite (Prisma)** using standard npm workspaces.

## Structure

```
Loker/
├── package.json               # Root monorepo workspaces configuration
├── PANDUAN_PENGGUNAAN.md      # Panduan lengkap penggunaan (Bahasa Indonesia)
├── apps/
│   ├── web/                   # React + Vite frontend application (Port 3000)
│   │   ├── src/
│   │   │   ├── components/    # Board, Drawer, Modal, Header, Sidebar, Analytics, etc.
│   │   │   ├── utils/         # textJobParser (Magic Paste), storage helpers
│   │   │   ├── types/         # TypeScript models
│   │   │   ├── App.tsx        # Main application state & responsive layout
│   │   │   └── index.css      # Material Design 3 tokens & Dark mode styling
│   │   ├── tailwind.config.js # Custom color palettes and typography
│   │   └── vite.config.ts
│   └── api/                   # Express + TypeScript backend API (Port 5000)
│       ├── prisma/            # SQLite schema & migrations
│       └── src/
│           ├── routes/        # Jobs, Auth, Analytics, Extract-URL
│           ├── lib/           # URL Scraper & parser helper
│           └── server.ts      # Express server entrypoint
└── README.md
```

## Features

- **5-Stage Kanban Board**: Wishlist, Applied, Interview, Offered, and Rejected columns with custom badges, counters, and stage actions.
- **Smart Input Automation**:
  - **Smart URL Extractor**: Automatically fetches job title, company, and links directly from job portal URLs (LinkedIn, Jobstreet, Glints, etc.).
  - **Magic Paste**: Parses raw job posting text and fills form fields with one click.
- **Slide-Over Detail Drawer**: Interactive drawer to manage salary offerings, work systems, recruiter contact details, status, and technical interview notes.
- **Dark & Light Mode**: Smooth theme toggling using semantic CSS variables.
- **Custom Profile Photo**: Client-side photo upload with circular crop canvas and instant preview.
- **Responsive Multi-Device**: Optimized for mobile (drawer sidebar & sticky Kanban headers), tablet, and desktop.
- **Advanced Filtering & Search**: Instant position/company search, work system filter (Remote, Hybrid, On-site), and dynamic salary brackets.
- **Analytics & Archive**: Application conversion funnel metrics and archive restoration.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Backend Database
```bash
cd apps/api
npm run db:push
npm run db:seed     # (Optional: seeds initial sample jobs)
cd ../..
```

### 3. Run Development Servers
You can run both apps concurrently or in separate terminals:

**Web Frontend (Port 3000):**
```bash
cd apps/web
npm run dev
```

**API Backend (Port 5000):**
```bash
cd apps/api
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

