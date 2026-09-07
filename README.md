# LOKER - Job Tracker Monorepo

> 📖 **Dokumentasi Lengkap & Panduan Penggunaan**: Silakan baca **[PANDUAN_PENGGUNAAN.md](file:///c:/laragon/www/Loker/PANDUAN_PENGGUNAAN.md)** untuk panduan instalasi, fitur, dan arsitektur lengkap dalam Bahasa Indonesia.

A modern, high-performance job application tracking platform built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Express + SQLite (Prisma)** using standard npm workspaces.

## Structure

```
Loker/
├── package.json          # Root monorepo workspaces configuration
├── apps/
│   └── web/              # React + Vite application
│       ├── src/
│       │   ├── components/ # Sidebar, Header, KanbanBoard, Drawer, Modal, Toast, etc.
│       │   ├── data/       # Initial mock jobs matching the wireframe
│       │   ├── types/      # TypeScript models
│       │   ├── App.tsx     # App layout & state management
│       │   └── index.css   # Tailwind base styling
│       ├── tailwind.config.js # Custom design tokens from the design specification
│       └── vite.config.ts
└── README.md
```

## Features

- **5-Stage Kanban Board**: Wishlist, Applied, Interview, Offered, and Rejected stages with custom badges, counters, and stage actions.
- **Notion-Style Detail Slide-Over Drawer**: Interactive drawer displaying hiring milestones timeline, offer salary, work system, CV attachments, technical notes editor, and status updater.
- **Advanced Filtering & Metrics**: Real-time position/company search, work arrangement filter (Remote, Hybrid, On-site), salary bracket filter (15jt - 30jt), and dynamic counter.
- **Add Job Modal**: Quick application logger to add new cards into any column.
- **Interactive Wireframe Simulation**: Displays drop zone indicator and tilted dragging preview card in the Interview column.
- **Analytics & Archive Views**: Overview metrics, conversion funnel, and archive storage.
- **Toast Feedback**: Real-time notifications on creation, editing, and stage updates.

## Getting Started

To install dependencies and start the dev server:

```bash
# In the root directory:
npm install

# Run the web application:
npm run dev
```

The app will be available at `http://localhost:3000`.
