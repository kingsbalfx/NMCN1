# Deploying Kingsbal (Web on Vercel, Backend on Railway/Render)

This guide shows how to deploy the `web` (Next.js) app to Vercel and the `backend` (Express) to a hosted service (Railway or Render). The web app should point to the backend URL via environment variables so the two connect reliably.

## Summary
- Web: Vercel (recommended for Next.js)
- Backend: Railway / Render / Heroku / Render (recommended for long-running processes and native modules)

## Pre-checks (locally)

1. Web build

```powershell
cd web
npm ci
npm run build
```

2. Backend start/test

```powershell
cd backend
npm ci
npm run start    # or npm run dev for local dev
```

If either step fails, fix build/runtime errors before deploying.

## Environment variables (common list)

Set these in the host platforms (Vercel and your backend host). Exact names used by the code:

- `DATABASE_URL` — PostgreSQL connection string for production DB
- `NODE_ENV` — set to `production`
- `JWT_SECRET` — secret for signing JWT tokens
- `OPENAI_API_KEY` — optional, for AI features
- `PAYSTACK_SECRET_KEY` — payment provider secret (if using)
- `CORS_ORIGIN` — allowed frontend origin (optional)
- `FRONTEND_URL` — public URL of the web app (set after Vercel deploy)
- `NEXT_PUBLIC_API_URL` — (Vercel only) public URL for the backend API, used client-side

Notes:
- Prefix any variable that must be available to client-side code with `NEXT_PUBLIC_`.
- Do NOT commit `.env` files containing secrets.

## Deploy backend (Railway / Render recommended)

Railway (quick):

1. Sign in to https://railway.app and create a new project → Deploy from GitHub.
2. Select the `backend/` folder as the root (or create a repository that contains only `backend`).
3. Set the build & start commands in the service settings (Railway infers Node.js):

```
Install: npm ci
Build: (not required for plain Node) or npm run build
Start: npm run start
```

4. Add environment variables listed above (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, PAYSTACK_SECRET_KEY, FRONTEND_URL, NODE_ENV=production).
5. Provision a PostgreSQL plugin on Railway and bind it to the service (Railway will set `DATABASE_URL`).
6. After launch, run migrations (if needed): `npm run migrate` on the Railway console or via one-off command.

Render (similar):

1. Create a new web service on Render, connect GitHub, and choose the `backend` folder.
2. Set the start command to `npm start` and environment variables.

After deploying backend, note the HTTPS URL (e.g. `https://api-yourapp.onrender.com`).

## Deploy web app to Vercel

1. Sign in to https://vercel.com and Import Project → choose GitHub repo `kingsbalfx/nmcn`.
2. During import set:
   - Root Directory: `web`
   - Framework Preset: `Next.js`
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output: default (Vercel manages Next)
3. In Project Settings → Environment Variables add:
   - `NEXT_PUBLIC_API_URL` = the backend URL (e.g. `https://api-yourapp.onrailway.app`)
   - Any other `NEXT_PUBLIC_...` variables the frontend needs
4. Deploy. Vercel will build and assign a production domain (and preview domains for PRs).

## Post-deploy

1. Set `FRONTEND_URL` in backend to the Vercel production URL.
2. Re-deploy backend if it reads `FRONTEND_URL` at startup, or set it dynamically.
3. Run smoke tests: open the site, hit critical pages and flows (auth, payments, questions).
4. Monitor logs: Vercel provides serverless logs; Railway/Render provide backend logs.

## Health checks and reliability

- Add a health endpoint on the backend (e.g., `/api/health`) and enable the host's health check.
- Avoid heavy CPU work in serverless functions — exec heavy jobs on backend.
- Use connection pooling for Postgres and graceful DB retry logic (code already implements demo mode fallback).

## Troubleshooting

- Build errors on Vercel: open the Build Logs and fix missing modules or TypeScript issues.
- 100MB file errors: ensure `node_modules` and build artifacts are not tracked in Git (already done).
- CORS errors: set `CORS_ORIGIN` or allow the Vercel domain in backend config.

## Useful local commands

```powershell
# Web
cd web
npm ci
npm run build

# Backend
cd backend
npm ci
npm run start
# Run migrations (if any)
npm run migrate
```

---
If you want, I can: (A) prepare `vercel.json` + minimal files in `web/` to tune Vercel behavior, and (B) add a short `backend/Procfile` and `backend/README_DEPLOY.md` with the exact env list and commands. Say `apply` and I'll add them to the repo and commit.
