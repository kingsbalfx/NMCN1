# Kingsbal Backend API

A comprehensive backend API for the Kingsbal Digital Healthcare Bridge platform, designed for Nigerian Nursing and Midwifery education.

## Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Question Bank Management (MCQ & Clinical)
- ✅ CBT & Clinical Exam System
- ✅ AI-Generated Question Generation
- ✅ Payment Processing (Paystack Integration)
- ✅ Subscription Management
- ✅ Admin Panel for Content Management
- ✅ Curriculum Management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **AI**: OpenAI API
- **Payments**: Paystack
- **Deployment**: Vercel

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/kingsbal
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=sk-xxx
   PAYSTACK_SECRET_KEY=sk_test_xxx
   PORT=5000
   ```

3. **Database Setup**
   ```sql
   -- Create database
   createdb kingsbal

   -- Run migrations (create tables)
   psql kingsbal < schema.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /test` - Test route

### Questions (`/api/questions`)
- `GET /test` - Test route
- `GET /:topicId` - Get questions by topic (Protected)
- `POST /explain` - Get AI explanation (Protected)

### Exams (`/api/exams`)
- `POST /cbt/start` - Start CBT exam (Protected)
- `POST /cbt/submit` - Submit CBT answers (Protected)
- `GET /clinical/:topicId` - Get clinical exams (Protected)
- `GET /test` - Test route

### Payments (`/api/payments`)
- `POST /initiate` - Initiate payment (Protected)
- `GET /verify/:reference` - Verify payment (Protected)
- `GET /status/:reference` - Check payment status (Protected)
- `GET /test` - Test route

### Admin (`/api/admin`)
- `GET /test` - Test route
- `POST /subjects` - Create subject (Protected + Admin)
- `GET /subjects` - Get all subjects (Protected + Admin)
- `POST /generate-course` - Generate AI course (Protected + Admin)
- `DELETE /subjects/:id` - Delete subject (Protected + Admin)

### Admin AI Questions (`/api/admin/ai-questions`)
- `POST /generate` - Generate multiple questions (Protected + Admin)
- `POST /generate-one` - Generate single question (Protected + Admin)
- `GET /test` - Test route

### Users (`/api/users`)
- `GET /profile` - Get user profile (Protected)
- `PUT /profile` - Update profile (Protected)
- `GET /exam-history` - Get exam results (Protected)
- `GET /test` - Test route

### Curriculum (`/api/curriculum`)
- `GET /topics` - Get all topics (Protected)
- `GET /category/:category` - Get topics by category (Protected)
- `GET /:topicId` - Get single topic (Protected)
- `POST /` - Create topic (Protected + Admin)
- `GET /test` - Test route

## Database Schema

Key tables required:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_expiry TIMESTAMP,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id),
  type VARCHAR(50),
  difficulty VARCHAR(50),
  question TEXT NOT NULL,
  options JSONB,
  correct_answer VARCHAR(100),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Results table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exam_id INTEGER,
  score INTEGER,
  total INTEGER,
  percentage INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  modules JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional info (development only)"
}
```

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run start
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
vercel --prod
```

## Security Notes

- ⚠️ **Change JWT_SECRET** in production
- ⚠️ **Enable HTTPS** in production
- ⚠️ **Validate all inputs** before database operations
- ⚠️ **Use environment variables** for sensitive data
- ⚠️ **Rate limiting** should be implemented for production

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists

### OpenAI Errors
- Verify OPENAI_API_KEY is set
- Check API key has available credits
- Review OpenAI rate limits

### Paystack Integration
- Verify PAYSTACK_SECRET_KEY is correct
- Test in development mode first
- Check transaction reference format

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For issues or questions, contact the development team or open an issue in the repository.

## License

ISC
