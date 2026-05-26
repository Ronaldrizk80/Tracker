# Follow-Up Tracker

Personal pending-items tracker for follow-ups across teams, emails, and projects.
React + Supabase, deployed as a PWA on GitHub Pages.

## What it tracks

- **Delegated tasks** — things you've handed off and are waiting on
- **Email replies** — outbound emails awaiting a response
- **Project milestones** — deliverables with deadlines

Each item has: entity, counterparty (who you're waiting on), due date, status, notes,
and an automatic age in days that drives the aging dashboard.

## Setup (one-time, ~15 minutes)

### 1. Create a Supabase project

1. Go to https://supabase.com → New project
2. Pick a name, region (Frankfurt is closest to Geneva), strong password
3. Wait for it to spin up (~2 min)

### 2. Run the schema

1. In Supabase: **SQL Editor** → New query
2. Paste the contents of `supabase-schema.sql`
3. Run it

### 3. Configure auth

1. **Authentication → Providers → Email**: make sure it's enabled
2. **Authentication → URL Configuration**:
   - Site URL: `https://YOUR-GITHUB-USERNAME.github.io/follow-up-tracker/`
   - Redirect URLs: add the same URL
   - For local dev also add: `http://localhost:5173/`

### 4. Get your project credentials

1. **Project Settings → API**
2. Copy `URL` and `anon public` key

### 5. Local install

```bash
git clone <your-repo-url> follow-up-tracker
cd follow-up-tracker
cp .env.example .env
# edit .env and paste in your Supabase URL + anon key
npm install
npm run dev
```

Open http://localhost:5173 — log in with your email (magic link) — start adding items.

### 6. Deploy to GitHub Pages

1. Create a GitHub repo named `follow-up-tracker`
2. Push this code to it
3. In `vite.config.js`, confirm `base: '/follow-up-tracker/'` matches your repo name
4. **Important**: GitHub Actions can't read your `.env` — add Supabase keys as repo secrets,
   then either build locally and use the `gh-pages` package, OR set up a GitHub Actions
   workflow. The simplest path:

```bash
npm run deploy
```

This builds the app and pushes `dist/` to a `gh-pages` branch. Then in GitHub:
**Settings → Pages → Source: gh-pages branch**.

### 7. Install as PWA on iPhone

1. Open the deployed URL in **Safari** (must be Safari, not Chrome)
2. Tap the Share icon → **Add to Home Screen**
3. The app icon appears on your home screen — opens full-screen like a native app

## Daily use

- **Aging dashboard** at the top shows 0–3, 4–7, 8–14, 15+ day buckets. Tap to filter.
- **Filter chips** for type and entity
- **Tap a task** to edit
- **Quick actions** on each card: Done, Snooze 3d, Nudged today
- **Eye toggle** in the header switches between open items and the "done" archive
- **+ button** to add a new item

## Architecture

- **Supabase** — Postgres + Auth + Realtime
- **React 18** + **Vite**
- **vite-plugin-pwa** for PWA generation (manifest + service worker)
- Aging buckets calculated client-side from `due_date` (fallback `created_at`)
- Realtime sync across devices (phone + laptop) via Supabase channels

## V2 roadmap (not in this build)

- Weekly digest email
- Snooze auto-resurface notifications
- Export to Excel
- "Email this counterparty" button (using Resend, once cocoa.capital DNS is verified)
- Recurring follow-ups
- Tagging
