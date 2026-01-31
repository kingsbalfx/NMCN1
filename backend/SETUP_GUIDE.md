# 🚀 Kingsbal Backend - Complete Setup Guide

## Overview

This guide will walk you through setting up and running the Kingsbal Digital Healthcare Bridge backend API locally and in production.

## ✅ What's Been Fixed & Implemented

### Core Issues Fixed
- ✅ **Variable Reference Errors** - Fixed undefined `pool` variable in questions and exams routes
- ✅ **OpenAI API** - Updated from deprecated `Configuration/OpenAIApi` to new `OpenAI` client
- ✅ **API Consistency** - Updated `createCompletion` to `chat.completions.create`
- ✅ **Error Handling** - Added comprehensive try-catch blocks to all routes
- ✅ **Input Validation** - Added request validation across all endpoints
- ✅ **Route Registration** - All routes now properly registered in server.js

### New Features Implemented
- ✅ **Error Middleware** - Global error handler for consistent responses
- ✅ **Users Module** - Profile, exam history, and user management endpoints
- ✅ **Curriculum Module** - Topic management and curriculum endpoints
- ✅ **Enhanced Auth** - Better error messages and validation
- ✅ **Enhanced Exams** - Exam tracking with percentage calculations
- ✅ **Enhanced Payments** - Payment status checking and better validation
- ✅ **AI Questions** - Batch generation with error tracking
- ✅ **Admin Features** - Subject management, course generation

### Documentation Added
- 📖 BACKEND_README.md - Complete setup and feature documentation
- 📖 API_DOCUMENTATION.md - Detailed endpoint reference with examples
- 📖 DATABASE_SCHEMA.sql - Complete database schema with indexes
- 📖 SETUP_GUIDE.md - This file!

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v14+ (Check: `node --version`)
- **npm** v6+ (Check: `npm --version`)
- **PostgreSQL** v12+ (Check: `psql --version`)
- **Git** (optional, for version control)

### Install Node.js & npm

**Windows:**
- Download from https://nodejs.org/
- Run the installer and follow prompts

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/
- Run installer with default settings

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

---

## 🔧 Local Development Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

Expected output should show all packages installing without errors.

### Step 2: Create Database

Open PostgreSQL command line:

```bash
# Linux/macOS
psql

# Windows (if psql not in PATH)
"C:\Program Files\PostgreSQL\15\bin\psql.exe"
```

Inside psql:

```sql
CREATE DATABASE kingsbal;
\c kingsbal

-- Then run the schema file
\i /path/to/DATABASE_SCHEMA.sql
```

Or in one command:

```bash
# Linux/macOS
psql -U postgres -c "CREATE DATABASE kingsbal;"
psql -U postgres -d kingsbal -f DATABASE_SCHEMA.sql

# Windows
psql -U postgres -c "CREATE DATABASE kingsbal;"
psql -U postgres -d kingsbal -f DATABASE_SCHEMA.sql
```

### Step 3: Configure Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database - local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/kingsbal
NODE_ENV=development

# JWT Secret - Generate a strong random string
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345

# OpenAI API Key - Get from https://platform.openai.com
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Paystack Secret Key - Get from https://dashboard.paystack.com
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=5000
HOST=localhost
```

**Generate a strong JWT_SECRET:**

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Step 4: Verify Setup

Run the validation script:

```bash
node validate-setup.js
```

Expected output:
```
✅ All checks passed! You're ready to go.
```

### Step 5: Start Development Server

```bash
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:5000
📝 Environment: development
```

### Step 6: Test the API

**Test health check:**

```bash
curl http://localhost:5000/
```

Response:
```json
{
  "message": "Kingsbal API is running 🚀",
  "status": "healthy"
}
```

**Test registration:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/kingsbal.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Select `backend` as root directory

3. **Set Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env`
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click Deploy
   - Wait for deployment to complete
   - Your API URL: `https://your-project.vercel.app`

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create kingsbal-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=sk_xxx
   heroku config:set JWT_SECRET=your_secret
   heroku config:set PAYSTACK_SECRET_KEY=sk_test_xxx
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   heroku logs --tail
   ```

### Option 3: AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04
   - Instance: t3.micro
   - Security: Allow ports 22, 80, 443

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql
   ```

3. **Setup Application**
   ```bash
   git clone <your-repo>
   cd backend
   npm install
   ```

4. **Configure Environment**
   - Create `.env` file with production values
   - Update DATABASE_URL to production PostgreSQL

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start api/index.js --name "kingsbal-api"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   ```

   Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   ```bash
   sudo service nginx restart
   ```

---

## 🗄️ Database Management

### Connect to Database

```bash
# Local development
psql -U postgres -d kingsbal

# Remote (Heroku/AWS)
psql <DATABASE_URL>
```

### Useful SQL Commands

```sql
-- View all tables
\dt

-- View table structure
\d users;

-- View all users
SELECT * FROM users;

-- Check questions count
SELECT COUNT(*) FROM questions;

-- View exam results
SELECT u.full_name, r.score, r.total, r.percentage 
FROM results r 
JOIN users u ON r.user_id = u.id;

-- Create test user
INSERT INTO users (full_name, email, password_hash, role) 
VALUES ('Test User', 'test@example.com', 'hash_here', 'user');

-- Reset all tables (WARNING: Deletes all data)
DELETE FROM results;
DELETE FROM questions;
DELETE FROM topics;
DELETE FROM users;
```

### Backup Database

```bash
# Local backup
pg_dump -U postgres kingsbal > backup.sql

# Restore from backup
psql -U postgres -d kingsbal < backup.sql

# Remote backup (Heroku)
heroku pg:backups:capture
heroku pg:backups:download
```

---

## 🧪 Testing APIs

### Using Postman

1. Download Postman from https://www.postman.com/
2. Create new collection "Kingsbal API"
3. Import endpoints from `API_DOCUMENTATION.md`
4. Set `{{baseUrl}}` = `http://localhost:5000/api`
5. Create auth environment variable with token from login

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John","email":"john@test.com","password":"pass123"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}' | jq -r '.token')

# Get topics with token
curl -X GET http://localhost:5000/api/curriculum/topics \
  -H "Authorization: Bearer $TOKEN"
```

### Using Thunder Client (VS Code)

1. Install "Thunder Client" extension
2. Create new request collection
3. Test endpoints with built-in environment support

---

## 🐛 Troubleshooting

### Issue: Port 5000 Already In Use

```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql@15  # macOS
```

### Issue: Cannot Find Module 'openai'

```bash
npm install
npm list openai  # Verify installation
```

### Issue: JWT Secret Not Set

```bash
echo $JWT_SECRET  # Check if set
source .env  # Load from .env (Linux/macOS)
```

### Issue: CORS Errors

Add to `src/server.js`:

```javascript
const cors = require("cors");
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
```

Then install:
```bash
npm install cors
```

---

## 📊 Monitoring & Logs

### View Logs

**Development:**
```bash
# Logs appear in terminal where npm run dev was started
```

**Production (Heroku):**
```bash
heroku logs --tail
heroku logs --tail --dyno=web
```

**Production (AWS/PM2):**
```bash
pm2 logs
pm2 logs kingsbal-api
tail -f ~/.pm2/logs/kingsbal-api-error.log
```

### Enable Debug Mode

```bash
# Development
DEBUG=* npm run dev

# Production
NODE_DEBUG=http,pg npm start
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS only in production
- [ ] Enable CORS with specific origins
- [ ] Set up rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable database SSL/TLS
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated

---

## 📞 Support & Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Express.js Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Paystack Docs:** https://paystack.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 🎉 You're All Set!

Your Kingsbal backend is now ready for development and deployment. Start building amazing features!

```bash
npm run dev
```

Happy coding! 🚀
