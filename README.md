# Traffic Control Intelligence Dashboard

A Next.js dashboard for monitoring traffic conditions, city risk levels, incidents, violations, response status, and predictive traffic insights across major Indian cities.

The app currently runs on a structured mock dataset, which makes it suitable for demos, UI development, and future integration with traffic, weather, mapping, or government data APIs.

## Features

- City selector with All India overview mode
- Vehicle count, average speed, violations, and accident insight cards
- India and city risk map views
- Recent traffic events with severity and response status
- Department status panel for police, hospital, fire, towing, and traffic control
- Key metrics for cameras, devices, alerts, fines, and hotspot zones
- Analysis, prediction, reports, rules engine, live map, and settings views
- Hydration-safe mock data for reliable Next.js SSR/client rendering

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Recharts
- Leaflet / React Leaflet
- Zustand
- Prisma scaffold included for future database work

## Project Structure

```text
src/
  app/
    page.tsx              Main dashboard shell and navigation state
    api/route.ts          Basic API route placeholder
  components/
    dashboard/            Dashboard-specific views and map panels
    ui/                   Reusable UI components
  hooks/                  Shared React hooks
  lib/
    dashboard-data.ts     Mock traffic/city/event/risk data
    city-store.ts         Selected city state
    db.ts                 Prisma client helper
prisma/
  schema.prisma           Database schema scaffold
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev       # Start the Next.js dev server on port 3000
npm run build     # Create a production build
npm run start     # Run the production standalone server
npm run lint      # Run ESLint
```

Database helper scripts are also present for future Prisma usage:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:reset
```

## Data Notes

The dashboard currently uses mock data from:

```text
src/lib/dashboard-data.ts
```

Important mock-data behavior:

- `All India` vehicle count represents the total active vehicles across tracked cities.
- Selected city vehicle count is estimated from that city's population.
- Events, risk markers, traffic insights, and prediction data are locally generated.
- Timestamps use a fixed mock clock to avoid hydration mismatches in Next.js.

## Connecting Real APIs

The cleanest migration path is to keep the existing frontend data shapes and replace the mock helpers with API-backed data.

Good API candidates:

- TomTom Traffic API for traffic flow, congestion, and incidents
- Open-Meteo for weather, temperature, rain, humidity, and wind
- OpenStreetMap / Overpass for road, junction, hospital, and police-station data
- data.gov.in for historical India road accident datasets

Recommended implementation:

1. Add a server route such as `src/app/api/dashboard/route.ts`.
2. Read secrets from `.env.local`.
3. Fetch external APIs from the server route, not directly in client components.
4. Transform external responses into the existing `TrafficInsight`, `EventData`, `CitySummary`, and `RiskMarker` shapes.
5. Use the mock data as a fallback when external APIs fail.

## Environment Variables

The app does not need environment variables while using mock data.

When external APIs are added, use `.env.local` locally and hosting provider environment variables in production:

```bash
TOMTOM_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

Do not commit `.env` or `.env.local`.

## Production Build

Check that the app builds successfully:

```bash
npm run build
```

Run the built app:

```bash
npm run start
```

## Deployment

Recommended hosting: Vercel.

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Use the Next.js framework preset.
4. Keep the default output directory.
5. Set environment variables in Vercel only if you add real APIs.

Suggested Vercel settings:

```text
Framework: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: default
```

## Git Push Quick Start

If you want to push this as a fresh repository:

```bash
git init
git branch -M main
git add .
git commit -m "Initial traffic dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Current Status

- Runs locally with `npm run dev`
- Production build passes with `npm run build`
- Uses mock data by default
- Ready to deploy as a Next.js app
