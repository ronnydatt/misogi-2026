# Misogi 2026

A simple rep tracker for the 2026 Misogi challenge: **10,000 push-ups, 10,000 squats, and 10,000 pull-ups**.

## Features

- Tap to log reps (+1, +5, +10, or custom)
- Daily, weekly, and year-to-date totals
- Progress bars toward 10k each
- Navigate between days to backfill
- Data persists in localStorage
- Mobile-first, works as PWA

## Setup

```bash
npm install
npm run dev
```

## Deploy

Build for production:

```bash
npm run build
```

Deploy the `dist` folder to Vercel, Netlify, or GitHub Pages.

## Add to Home Screen (iOS)

1. Open in Safari
2. Tap share icon
3. "Add to Home Screen"

## Data

All data is stored in `localStorage` under the key `misogi-2026`. Export by copying from browser dev tools if needed.

---

*30,000 reps. 365 days. No excuses.*
