# Property AI Toolkit — Next.js Migration (Scaffold)

This workspace contains a minimal Next.js scaffold converted from a static HTML/CSS/JS project.

## What I added

- `package.json`, `next.config.js`
- `pages/_app.js`, `pages/index.js`, `pages/dashboard.js`, `pages/ocr2json.js`
- `styles/globals.css` (adapted from your `style.css`)

## How to run (Windows cmd)

1. Open a terminal in the project folder (where `package.json` is located).

1. Install dependencies:

```cmd
npm install
```

1. Run the dev server:

```cmd
npm run dev
```

1. Open `http://localhost:3000` in your browser.

## Notes

- This repo contains Next.js pages ported from your original static site. The OCR and Dashboard flows are implemented as React pages.
- You should secure webhook URLs and consider moving them to environment variables before deploying.

If you'd like, I can replace `README.md` with this cleaned version and enable stricter TypeScript flags (I kept `strict` off to minimize changes).
