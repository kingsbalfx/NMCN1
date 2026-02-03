# Kingsbal API - Vercel Deployment Guide

## ✅ Fixed & Ready for Deployment

The API is now fully functional on Vercel with all routes working in both production and demo mode.

### 🚀 Health Check Endpoints

```bash
# Basic health check
GET /
Response: {"message":"Kingsbal API is running 🚀","status":"healthy","timestamp":"...","version":"1.0.0"}

# Health status
GET /health
Response: {"status":"healthy","service":"Kingsbal API","timestamp":"..."}

# API status
GET /api/status
Response: {"message":"Kingsbal API is running 🚀","status":"healthy","environment":"production"}
```

### 📚 Public Endpoints (No Auth Required)

#### Nursing Questions (Demo/Testing)
```bash
# Get all nursing questions
GET /api/public/nursing-questions?limit=10

# Get questions by topic
GET /api/questions/all?limit=50
GET /api/questions/topic/anatomy?limit=20
```

#### Curriculum (Public Access)
```bash
# Get all topics
GET /api/curriculum/topics

# Get topics by category
GET /api/curriculum/category/Clinical

# Get single topic
GET /api/curriculum/:topicId
```

### 🔐 Authentication Endpoints

#### Register/Login
```bash
# Register new user
POST /api/auth/register
Body: { "full_name": "...", "email": "...", "password": "..." }

# Login
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "token": "...", "user": {...} }

# Get current user
GET /api/auth/me
Headers: { "Authorization": "Bearer <token>" }

# Test auth route
GET /api/auth/test
```

#### Demo Credentials (Demo Mode Only)
```
Student:
  Email: demo@kingsbal.com
  Password: password123
  Role: student

Admin:
  Email: admin@kingsbal.com
  Password: admin123
  Role: admin
```

### 📖 Question Endpoints

#### Get Questions (Protected)
```bash
# Test route
GET /api/questions/test

# Get all questions (public demo)
GET /api/questions/all?limit=50

# Get questions by topic (public demo)
GET /api/questions/topic/:topicId?limit=20

# Protected route (requires auth)
GET /api/questions/:topicId
Headers: { "Authorization": "Bearer <token>" }
```

#### Get Explanations
```bash
POST /api/questions/explain
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "question_text": "What is...",
  "topic": "Anatomy",
  "difficulty": "medium"
}
```

### 📝 Exam Endpoints

```bash
# Start CBT exam
POST /api/exams/cbt/start
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "topic_id": "anatomy",
  "limit": 50
}

# Submit exam
POST /api/exams/cbt/submit
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "exam_id": "exam_123",
  "answers": [
    { "question_id": 1, "user_answer": "A", "correct_answer": "A" },
    ...
  ]
}

# Test route
GET /api/exams/test
```

### 👤 User Endpoints

```bash
# Get profile (protected)
GET /api/users/profile
Headers: { "Authorization": "Bearer <token>" }

# Update profile (protected)
PUT /api/users/profile
Headers: { "Authorization": "Bearer <token>" }
Body: { "full_name": "...", "phone": "..." }

# Get exam history (protected)
GET /api/users/exam-history
Headers: { "Authorization": "Bearer <token>" }

# Test route
GET /api/users/test
```

### 💳 Payment Endpoints

```bash
# Initiate payment (protected)
POST /api/payments/initiate
Headers: { "Authorization": "Bearer <token>" }
Body: { "amount": 5000 }

# Verify payment (protected)
GET /api/payments/verify/:reference
Headers: { "Authorization": "Bearer <token>" }

# Test route
GET /api/payments/test
```

### 👨‍💼 Admin Endpoints

```bash
# Get all subjects (admin only)
GET /api/admin/subjects
Headers: { "Authorization": "Bearer <admin_token>" }

# Add subject (admin only)
POST /api/admin/subjects
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "name": "Subject Name",
  "category": "Clinical",
  "description": "..."
}

# Generate AI course (admin only)
POST /api/admin/generate-course
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "title": "Course Title",
  "category": "Fundamentals",
  "description": "..."
}

# Delete subject (admin only)
DELETE /api/admin/subjects/:id
Headers: { "Authorization": "Bearer <admin_token>" }

# Generate AI questions (admin only)
POST /api/admin/ai-questions/generate
Headers: { "Authorization": "Bearer <admin_token>" }
Body: {
  "topic_id": 1,
  "type": "mcq",
  "difficulty": "hard",
  "count": 10
}

# Test route
GET /api/admin/test
```

## 🛠️ Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database (optional - uses demo mode if not set)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI (optional - for AI question generation)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Paystack (optional - for payment processing)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Server
PORT=5000
HOST=0.0.0.0
NODE_ENV=production
```

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
cd backend
vercel deploy
```

### 3. Set Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
vercel env add PAYSTACK_SECRET_KEY
```

### 4. Redeploy with env vars
```bash
vercel deploy --prod
```

## 📊 Features

✅ **Health Checks** - Multiple endpoints to verify API status
✅ **Demo Mode** - Works without database (falls back to mock data)
✅ **Demo Credentials** - Pre-configured test users
✅ **Nursing Questions** - 10+ fallback questions in all topics
✅ **Public Endpoints** - Questions, curriculum, and status available without auth
✅ **Protected Endpoints** - Full auth/subscription support
✅ **AI Integration** - OpenAI for generating questions and courses
✅ **Error Handling** - Graceful fallbacks for all failures
✅ **Logging** - Request logging and error tracking

## 🔍 Testing

### Using cURL
```bash
# Health check
curl -X GET https://your-api.vercel.app/

# Get nursing questions
curl -X GET https://your-api.vercel.app/api/public/nursing-questions?limit=5

# Login
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@kingsbal.com","password":"password123"}'

# Get profile
curl -X GET https://your-api.vercel.app/api/users/profile \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Import the Vercel API endpoints
2. Create environment variables for token
3. Test each endpoint

## ⚠️ Important Notes

- The API works in **DEMO MODE** when DATABASE_URL is not set
- All routes have fallback responses for reliability
- Authentication is optional for read-only endpoints
- Full database features available when DATABASE_URL is configured
- AI features require OPENAI_API_KEY

## 🐛 Troubleshooting

### 404 Not Found
- Check endpoint path matches exactly
- Verify HTTP method (GET, POST, etc.)
- Check authentication token if protected

### 401 Unauthorized
- Provide valid JWT token in Authorization header
- In demo mode, use provided test credentials
- Token format: "Bearer <token>"

### 500 Internal Server Error
- Check server logs on Vercel dashboard
- Verify environment variables are set
- Check database connection if DATABASE_URL configured

## 📞 Support

For issues and questions:
1. Check API logs on Vercel dashboard
2. Verify environment variables
3. Test with demo mode first
4. Check request format and headers

---

**API Version:** 1.0.0  
**Last Updated:** February 2, 2026  
**Status:** ✅ Production Ready for Vercel
