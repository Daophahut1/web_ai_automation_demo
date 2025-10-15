# Property AI Toolkit — Next.js Demo

A minimal Next.js (Pages) demo that proxies external webhooks through server-side API routes and provides a small UI for scraping / OCR workflows.

This repository is intended as a light migration of a static demo to Next.js using Chakra UI for styling.

## Quick start (local)

1. Copy the example environment file:

   ```cmd
   copy .env.local.example .env.local
   ```

2. Install dependencies:

   ```cmd
   npm install
   ```

3. Start the dev server:

   ```cmd
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Environment variables

Set these in `.env.local` (for local testing) or in your host's environment (Vercel project settings):

- `LISTINGS_WEBHOOK` — external listings webhook URL (server-side)
- `TEST_WEBHOOK` — external test webhook URL (server-side)
- `OCR_WEBHOOK` — external OCR processing webhook URL (server-side)

Optional client-side (for debugging):

- `NEXT_PUBLIC_LISTINGS_WEBHOOK`, `NEXT_PUBLIC_TEST_WEBHOOK`, `NEXT_PUBLIC_OCR_WEBHOOK`

> Keep `.env.local` out of source control. Do not commit secrets.

## Deploy to Vercel

1. Push the repository to GitHub (or GitLab / Bitbucket).
2. Create a new project on Vercel and import the repository.
3. In the Vercel dashboard, add the required environment variables (the server-side ones listed above).
4. Deploy. Vercel will detect Next.js and run `npm run build` automatically.

## Project structure (high level)

- `pages/` — Next.js pages and API routes
- `public/` — static assets
- `components/` — common UI components (Topbar, Footer)
- `theme.ts` — Chakra UI theme

## Notes

- API routes proxy to the webhook URLs above. Ensure those endpoints are reachable from Vercel.
- The project uses Next.js Pages Router and serverless functions for `pages/api/*`.

## Coming soon

- Replace the lightweight JSON highlighter with an embedded code editor (CodeMirror/Monaco) for an editable, feature-rich experience.
- Add tests and CI workflow (GitHub Actions) that builds and verifies the app on push.
- Add optional authentication and rate-limiting for API endpoints.

If you want me to implement any of the 'Coming soon' items, tell me which and I'll start.
