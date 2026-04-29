# 🚀 Kingsbal Platform - Vercel & Backend Deployment Guide

## **Pre-Deployment Checklist**

### ✅ Frontend (Next.js Web App)
- [ ] All environment variables set in `.env.local` (copy to Vercel)
- [ ] No console errors in development (`npm run dev`)
- [ ] Build succeeds locally: `npm run build`
- [ ] All pages load correctly in production mode

### ✅ Backend (Express.js Server)
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Admin user seeded (see seed script section)
- [ ] All API endpoints tested with demo credentials
- [ ] No hardcoded secrets in code

### ✅ Database
- [ ] PostgreSQL/Supabase database created and accessible
- [ ] Database URL stored securely (not in git)
- [ ] All tables migrated

---

## **PART 1: Frontend Deployment (Vercel)**

### **Step 1: Connect GitHub Repository**

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select the correct project folder: `/kingsbal_digital_healthcare_bridge` (root)
5. Vercel auto-detects **Next.js**

### **Step 2: Configure Environment Variables**

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/2347xxxxxxxxxx
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/kingsbalhq
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/kingsbalhq
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/kingsbalhq
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/kingsbalhq
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@kingsbalhq
```

> ⚠️ **Important**: Use `NEXT_PUBLIC_` prefix for client-side variables only

### **Step 3: Deploy**

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. Vercel provides your URL: `https://your-app.vercel.app`

### **Step 4: Verify Deployment**

- [ ] Site loads at `https://your-app.vercel.app`
- [ ] Social media links working
- [ ] Login page displays correctly
- [ ] No Mixed Content errors (HTTP vs HTTPS)

---

## **PART 2: Backend Deployment (Railway or Render)**

### **Option A: Railway (Recommended for Speed)**

#### **Step 1: Create Railway Account & Project**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → **GitHub repo** → select your repository

#### **Step 2: Add PostgreSQL Database**

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway auto-creates `DATABASE_URL` env var

#### **Step 3: Configure Environment Variables**

In Railway project settings → **Variables**, add:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=<auto-populated by Railway>
JWT_SECRET=your-super-secret-key-min-32-chars-here-!!
FRONTEND_URL=https://your-app.vercel.app
API_URL=https://your-api.railway.app

# Optional: Email service for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@kingsbal.com
```

#### **Step 4: Deploy**

1. Connect your GitHub repo in Railway
2. Select `/backend` folder as root
3. Railway auto-detects `Node.js` from `package.json`
4. Set **start command**: `npm start`
5. Deploy → Railway builds and runs automatically

#### **Step 5: Get Backend URL**

- Railway generates: `https://your-api.railway.app`
- Update frontend `NEXT_PUBLIC_API_URL` in Vercel to this URL

---

### **Option B: Render (Alternative)**

#### **Step 1: Connect Repository**

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Select GitHub repo

#### **Step 2: Configure Service**

| Setting | Value |
|---------|-------|
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Region** | Choose nearest (US/EU) |
| **Plan** | Starter (free tier available) |

#### **Step 3: Add PostgreSQL Database**

1. Click **"New +"** → **"PostgreSQL"**
2. Set name: `kingsbal-db`
3. Render auto-creates `DATABASE_URL`

#### **Step 4: Link Database & Deploy**

1. In web service → **Environment** → add variables:
   ```env
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=your-super-secret-key-min-32-chars-here-!!
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
2. Render deploys automatically

#### **Step 5: Get Backend URL**

- Render generates: `https://your-api.onrender.com`
- Update Vercel `NEXT_PUBLIC_API_URL`

---

## **PART 3: Database Setup**

### **Step 1: Run Migrations**

After backend deployment, run migrations:

```bash
# Option A: Via Railway/Render terminal
npm run migrate

# Option B: Manual SQL execution
# Copy content from backend/DATABASE_SCHEMA.sql and run in database client
```

### **Step 2: Seed Admin User**

```bash
# Create backend/scripts/seed_admin.js
node backend/scripts/seed_admin.js
```

**seed_admin.js content:**

```javascript
require('dotenv').config();
const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('014/Pt/014', 10);
    
    const query = `
      INSERT INTO users (full_name, username, email, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (email) DO NOTHING
    `;
    
    await pool.query(query, [
      'Admin User',
      'admin',
      'shafiuabdullahi.sa3@gmail.com',
      hashedPassword,
      'admin'
    ]);
    
    console.log('✅ Admin user seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
```

---

## **PART 4: Testing & Verification**

### **Test Frontend**

```bash
# 1. Visit your Vercel URL
https://your-app.vercel.app

# 2. Test login with:
# - Username: kingsbalfx (demo user)
# - Password: password123

# Or admin login:
# - Username: admin
# - Password: 014/Pt/014

# 3. Verify:
# - ✅ Login succeeds
# - ✅ Dashboard loads
# - ✅ Social media links work
# - ✅ Password reset flow shows
```

### **Test Backend**

```bash
# 1. Test API health
curl https://your-api.railway.app/health

# 2. Test demo login
curl -X POST https://your-api.railway.app/api/auth/test

# 3. Test question generation (admin only)
curl -X POST https://your-api.railway.app/api/admin/ai-questions/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Pharmacology","count":5}'
```

### **Test Database Connection**

In Railway/Render terminal:

```bash
node -e "
const pool = require('./src/config/database');
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ DB Error:', err);
  else console.log('✅ DB Connected:', res.rows[0]);
  process.exit(0);
});
"
```

---

## **PART 5: Common Issues & Fixes**

### **❌ 502 Bad Gateway**

**Cause**: Backend service not responding

**Fixes**:
1. Check backend logs in Railway/Render
2. Verify `DATABASE_URL` is set
3. Restart service: Railway → Restart / Render → Manual Deploy
4. Check if database is running

### **❌ CORS Error**

**Frontend error**: "Access to XMLHttpRequest blocked by CORS policy"

**Fix**: Update `backend/src/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then redeploy backend.

### **❌ API_URL Undefined**

**Cause**: Environment variable not set in Vercel

**Fix**:
1. Vercel → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL=https://your-api.railway.app`
3. Redeploy: **Deployments** → **Redeploy**

### **❌ Admin Questions Button Not Working**

**Cause**: User role not set to `admin`

**Fix**:
1. Use admin credentials to login
2. Or manually update user in database:
   ```sql
   UPDATE users SET role='admin' WHERE email='your-email@example.com';
   ```

### **❌ Login Returns "Invalid Credentials"**

**Cause**: Wrong username/password or demo mode not enabled

**Fix**:
1. If using demo credentials: Check `backend/.env` has no `DATABASE_URL`
2. If using production DB: Verify user exists
   ```sql
   SELECT * FROM users WHERE email='your-email@example.com';
   ```

---

## **PART 6: Post-Deployment Monitoring**

### **Setup Error Tracking**

Add to `backend/src/server.js`:

```javascript
// Optional: Sentry for error tracking
// const Sentry = require("@sentry/node");
// Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### **Monitor Logs**

**Railway**: Dashboard → Deployments → View Logs
**Render**: Dashboard → Logs → View
**Vercel**: Deployments → Function logs

### **Set Up Alerts**

- Railway: Settings → Notifications → Slack/Email
- Render: Dashboard → Alert Notifications
- Vercel: Account → Notifications

---

## **PART 7: Security Checklist**

- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] `DATABASE_URL` not committed to git
- [ ] HTTPS enabled (auto by Vercel/Railway/Render)
- [ ] CORS properly configured
- [ ] Admin routes protected by `admin` middleware
- [ ] Password hashed with bcrypt
- [ ] API keys/secrets not in frontend code
- [ ] `.env` file in `.gitignore`

---

## **PART 8: Scaling for Production**

### **Database Optimization**

```sql
-- Add indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_exams_user_id ON exams(user_id);
```

### **Caching**

Add Redis for session management (optional):

```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL // For Railway: auto-available
});
```

### **CDN for Static Assets**

Vercel auto-handles this. For backend:
- Upload images to AWS S3 / Cloudinary
- Reference via CDN URL

---

## **Quick Reference: Connection Checklist**

| Component | Deployed URL | Env Var | Status |
|-----------|--------------|---------|--------|
| Frontend | https://your-app.vercel.app | N/A | ✅ |
| Backend API | https://your-api.railway.app | `NEXT_PUBLIC_API_URL` | ⏳ |
| Database | Managed by Railway | `DATABASE_URL` | ⏳ |
| Admin User | (in DB) | (seed script) | ⏳ |

---

## **Support & Next Steps**

1. **Test thoroughly** with all user roles (student, admin)
2. **Monitor logs** for first 24 hours
3. **Set up backups** for production database
4. **Plan scaling** as user base grows
5. **Document deployment** process for team

---

**Deployment completed! 🎉**

Your platform is now live at:
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔌 Backend API: `https://your-api.railway.app`
- 📊 Admin: Login with `admin` / `014/Pt/014`
