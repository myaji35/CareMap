# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CareMap** is a modern SaaS data dashboard that visualizes long-term care institutions across Korea. The application provides map-based visualization with historical tracking of institution data (capacity, occupancy, address, etc.) to help caregivers and industry professionals make informed decisions.

**Core Value Proposition:** Track and visualize the "history and flow" of institution data over time, not just current state.

## Tech Stack

- **Frontend:** Next.js 15 (App Router, Turbopack), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui (New York, Slate theme)
- **Database:** Neon.tech (Serverless PostgreSQL)
- **ORM:** Prisma (client output: `src/generated/prisma`)
- **Maps:** Kakao Maps (`react-kakao-maps-sdk`)
- **Charts:** Recharts

## Development Commands

### Running the Application
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
```

### Database Operations
```bash
npx prisma db push   # Sync Prisma schema to Neon.tech database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client (outputs to src/generated/prisma)
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## Architecture

### Data Model Design (Dual-Table Pattern)

The application uses a **snapshot + history** pattern to track institutional changes over time:

- **`Institution` table:** Stores the latest/current state of each institution
  - Primary key: `institutionCode` (unique identifier from source data)
  - Contains: name, serviceType, capacity, currentHeadcount, address, lat/lng
  - Updated monthly via crawler (overwrites existing data)

- **`InstitutionHistory` table:** Stores historical snapshots before updates
  - Related to `Institution` via foreign key
  - Contains: recordedDate, name, address, capacity, currentHeadcount
  - New record created when ANY field changes (name, address, capacity, or currentHeadcount)

**Important:** Prisma schema uses custom output path (`src/generated/prisma`). Import Prisma Client from this location, not `@prisma/client`.

### File Structure Convention

```
src/
├── app/                      # Next.js App Router pages & API routes
│   ├── api/                  # Backend API endpoints
│   │   └── institutions/     # Institution-related APIs
│   ├── dashboard/            # Dashboard pages (uses layout)
│   │   ├── layout.tsx        # SaaS layout (Sidebar + main content)
│   │   └── map-view/         # Map visualization page
│   └── layout.tsx            # Root layout (fonts, metadata)
├── components/               # Reusable React components
│   ├── layout/               # Layout components (Sidebar, etc.)
│   ├── ui/                   # shadcn/ui components
│   └── ...                   # Feature components (markers, popups, charts)
└── generated/
    └── prisma/               # Generated Prisma Client (gitignored)
```

### Key UX Flow

1. **Map View:** Custom pie chart markers show capacity vs. occupancy ratio
   - Marker displays: `currentHeadcount/capacity` (e.g., "85/100")
   - Red warning when overcapacity (e.g., "110/100")
2. **Popup (Popover):** Click marker → shadcn/ui Popover shows basic info
3. **History Modal (Dialog):** Click "View History" → shadcn/ui Dialog with Recharts time-series analysis

### Data Pipeline (Monthly Crawler)

The system should implement a monthly crawler that:
1. Scrapes institution data from `longtermcare.or.kr`
2. Compares with current `Institution` table
3. If ANY field changed → backup old record to `InstitutionHistory` with `recordedDate`
4. Update `Institution` table with latest data
5. Use geocoding to convert addresses to lat/lng

## Project-Specific Guidelines

### Environment Variables

- Database URLs are defined in `.env` (gitignored)
- For local development: Uses Prisma Postgres local server
- For production: Use Neon.tech DATABASE_URL and DIRECT_URL
- When deploying to Vercel, set environment variables in project settings

### shadcn/ui Component Installation

Install components as needed:
```bash
npx shadcn@latest add button
npx shadcn@latest add popover
npx shadcn@latest add dialog
npx shadcn@latest add skeleton
```

### Responsive Design

- Desktop: Fixed sidebar on left, main content on right
- Mobile: Convert sidebar to hamburger menu (Milestone 4 feature)

### Deployment

- Platform: Vercel
- Database: Neon.tech serverless Postgres
- Ensure environment variables are set in Vercel dashboard before deployment
- The app uses Turbopack for both dev and production builds

## Current Project Status

Reference `task.md` for detailed implementation checklist organized by milestones:
- **Milestone 1:** Data pipeline foundation (Prisma schema, API routes, crawler MVP)
- **Milestone 2:** Core UX with map visualization and custom markers
- **Milestone 3:** Historical analysis feature with time-series charts
- **Milestone 4:** Polish, responsive design, and production deployment

See `prd.md` for complete feature specifications and user stories (USR-001 through USR-015).
