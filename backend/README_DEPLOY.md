\# Backend deployment notes

Place these instructions when deploying the `backend/` service to Railway, Render, Heroku, etc.

\#\# Start command

Use:

```
npm start
```

or for development:

```
npm run dev
```

\#\# Environment variables required

- `DATABASE_URL` (postgres) — if not set the app runs in demo mode (no real DB)
- `NODE_ENV=production`
- `JWT_SECRET` — strong secret for authentication tokens
- `OPENAI_API_KEY` — optional
- `PAYSTACK_SECRET_KEY` — optional (payments)
- `CORS_ORIGIN` — optional, e.g., `https://your-frontend.vercel.app`
- `FRONTEND_URL` — set to front-end public URL

\#\# Run migrations / seed

To run migrations (if used in your hosting console):

```
npm run migrate
npm run seed
```

\#\# Process type (Procfile)

For platforms that use a Procfile, use:

```
web: node api/index.js
```

---
After deployment, copy the backend HTTPS URL and set `NEXT_PUBLIC_API_URL` in the Vercel project for the `web` app.
