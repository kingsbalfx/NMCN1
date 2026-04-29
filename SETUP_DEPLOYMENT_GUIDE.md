# Kingsbal Digital Healthcare Bridge - Setup & Deployment Guide

## 📋 Overview

Kingsbal is a student-friendly nursing and midwifery exam prep platform featuring:
- **Modern Auth**: JWT + HttpOnly cookies for secure credential handling
- **Dashboard**: Personalized learning experience with exam questions, mock tests, and subscriptions
- **Pricing**: ₦1,200/month per user with Paystack integration (demo mode available)
- **Admin Panel**: Manage subjects, questions, and student accounts
- **Responsive UI**: Built with Next.js + React on frontend, Express.js on backend

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 16+ (with npm)
- **PostgreSQL** (optional; demo mode works without DB)
- **Git**

### Step 1: Clone and Install

```bash
cd c:\Users\HP\Downloads\kingsbal\kingsbal_digital_healthcare_bridge

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../web
npm install
```

### Step 2: Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/kingsbal
JWT_SECRET=your-super-secret-key-min-32-chars
PAYSTACK_SECRET_KEY=sk_live_xxxxx
OPENAI_API_KEY=sk-xxxxx
```

If `DATABASE_URL` is not set, the backend runs in **demo mode** with mock users.

**Frontend** (`web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Start Services

**Terminal 1 - Backend**:
```bash
cd backend
node api/index.js
```

Expected output:
```
✅ Server running on http://0.0.0.0:5000
📝 Environment: production
🔌 Database: Connected to Supabase
🤖 AI: Enabled (OpenAI)
```

**Terminal 2 - Frontend**:
```bash
cd web
npm run dev
```

Expected output:
```
✓ Ready in 3.8s
- Local: http://localhost:3000
```

### Step 4: Access the App

1. **Frontend**: Visit [http://localhost:3000](http://localhost:3000)
2. **Login**: Use demo credentials
   - Email: `demo@kingsbal.com`
   - Password: `password123`
3. **Admin**: Go to `/admin/users` to manage students (requires admin role)

---

## 🧪 Testing

### Run Smoke Tests (Backend)

```bash
cd backend
node scripts/smoke_test.js
```

Tests health, auth, payments, and nursing questions endpoints.

### Run E2E Tests (Integration)

```bash
cd backend
node scripts/e2e_test.js
```

Tests full flow: register → login → get user → initiate payment → public endpoints.

### Manual Frontend Testing

1. **Register**: Visit [http://localhost:3000/register](http://localhost:3000/register)
2. **Login**: Use registered credentials
3. **Dashboard**: View personalized welcome and quick links
4. **Subscribe**: Visit [http://localhost:3000/subscribe](http://localhost:3000/subscribe) to test payment UI

---

## 🔐 Authentication Flow

### Modern Credential Handling
- **Login** sets an **HttpOnly cookie** (`token`) for secure storage
- **Frontend API client** sends Authorization header with token for backward compatibility
- **Auto-logout** on 401 responses (handled in API interceptor)
- **Protected routes** verify session via `/auth/me` on load

### Demo Mode vs Database Mode
- **Demo**: No DB needed; mocked users (see `auth.routes.js`)
  - Admin: `admin@kingsbal.com` / `admin123`
  - Student: `demo@kingsbal.com` / `password123`
- **Database**: Real PostgreSQL with bcrypt hashing

---

## 💳 Payments

### Demo Mode
- `/payments/initiate` returns mock reference (starts with `DEMO_`)
- Frontend redirects to demo checkout page
- No real charges

### Real Mode (Paystack)
- Set `PAYSTACK_SECRET_KEY` in `.env`
- Frontend redirects to Paystack checkout
- On success, subscription is auto-activated for 1 month
- **Price**: ₦1,200 per user (hardcoded in `subscribe.js` → `amount: 1200`)

---

## 📁 Project Structure

```
kingsbal_digital_healthcare_bridge/
├── backend/
│   ├── api/index.js                 # Server entry point
│   ├── src/
│   │   ├── server.js                # Express app + middleware
│   │   ├── modules/
│   │   │   ├── auth/                # Login, register, JWT
│   │   │   ├── questions/           # Question retrieval
│   │   │   ├── payments/            # Paystack integration
│   │   │   ├── admin/               # Admin endpoints
│   │   │   └── users/               # User profiles
│   │   └── middleware/
│   │       ├── auth.js              # JWT verification + cookie support
│   │       └── subscription.js      # Check active subscription
│   ├── nursing_questions/           # Question banks (JSON)
│   ├── scripts/
│   │   ├── smoke_test.js            # API health checks
│   │   └── e2e_test.js              # Full integration test
│   └── package.json
│
├── web/
│   ├── pages/
│   │   ├── _app.js                  # Next.js app wrapper
│   │   ├── index.js                 # Home / Landing
│   │   ├── login.js                 # Login form (modern UI)
│   │   ├── register.js              # Register form (modern UI)
│   │   ├── dashboard.js             # Student dashboard
│   │   ├── subscribe.js             # Subscription card (₦1,200)
│   │   ├── admin/
│   │   │   ├── index.js             # Admin home (card grid)
│   │   │   ├── users.js             # User management (modern table)
│   │   │   ├── questions.js         # Add/edit questions
│   │   │   └── subjects.js          # Manage subjects
│   │   └── questions/               # Question exploration by topic
│   ├── components/
│   │   ├── Layout.js                # Page wrapper + navbar
│   │   ├── Navbar.js                # Top navigation
│   │   ├── ProtectedRoute.js        # Auth check + /auth/me verification
│   │   └── ...
│   ├── services/
│   │   └── api.js                   # Axios client with cookie + auth header support
│   ├── styles/
│   │   └── globals.css              # Base styles
│   ├── .env.local                   # Frontend env config
│   ├── package.json
│   └── next.config.js
│
└── README.md (this file)
```

---

## 🛠️ Common Issues & Fixes

### 1. **Backend won't start**
```bash
# Check port 5000 is free
netstat -ano | findstr :5000  # Windows
# Kill process if needed
taskkill /PID <PID> /F
```

### 2. **Frontend can't reach backend (CORS)**
- Ensure backend has `CORS` enabled (default: ✅)
- Verify `NEXT_PUBLIC_API_URL` in `web/.env.local`
- Frontend API client uses `withCredentials: true` for cookies

### 3. **Auth fails silently**
- Check `localStorage` for token (browser DevTools → Application)
- Verify cookie is set in Network tab (check Response Headers)
- Ensure JWT_SECRET matches between requests

### 4. **No users appear in admin panel**
- Demo mode: Users added during registration/login are stored in memory
- Database mode: Check PostgreSQL is running and `DATABASE_URL` is set
- Run `/admin/users` endpoint directly to debug

---

## 📦 Deployment

### Vercel (Recommended for Frontend)

```bash
cd web
npm run build
vercel deploy
```

### Heroku / Cloud Run (Backend)

```bash
cd backend
# Deploy with Procfile included
heroku create kingsbal-api
heroku config:set DATABASE_URL=...
git push heroku main
```

### Environment Variables
Set in hosting platform (Vercel, Heroku, etc.):
- `DATABASE_URL`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `OPENAI_API_KEY`

---

## 🔄 Git Workflow

```bash
# Create a feature branch
git checkout -b feature/modern-auth

# Make your changes, then commit
git add .
git commit -m "feat: modernize auth with HttpOnly cookies and auto-logout"

# Push and create PR
git push origin feature/modern-auth
```

---

## 📞 Support & Contributions

- **Issues**: Report bugs via GitHub Issues
- **PRs**: Welcome! Follow the commit message style above
- **Questions**: Check existing docs or open a discussion

---

## 📝 License

ISC - See LICENSE file

---

## 🎯 Next Steps

- [ ] Set up production database (PostgreSQL on Supabase/AWS)
- [ ] Configure Paystack production keys
- [ ] Add email verification for sign-ups
- [ ] Implement analytics (Google Analytics)
- [ ] Add mobile app sync (Flutter)
- [ ] Set up CI/CD pipeline (GitHub Actions)

---

**Happy learning! 🚀**
