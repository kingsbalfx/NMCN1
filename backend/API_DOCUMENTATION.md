# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Global Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>  # Required for protected endpoints
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "Registered successfully",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400/409):**
```json
{
  "error": "Email already registered"
}
```

### Login User
```
POST /auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Questions Endpoints

### Get Questions by Topic
```
GET /questions/:topicId
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "question": "What is the normal blood pressure?",
    "options": {
      "A": "120/80 mmHg",
      "B": "140/90 mmHg",
      "C": "100/60 mmHg",
      "D": "150/100 mmHg"
    },
    "correct_answer": "A",
    "explanation": "Normal blood pressure is 120/80 mmHg...",
    "topic_id": 1,
    "type": "mcq",
    "difficulty": "easy"
  }
]
```

### Get AI Explanation
```
POST /questions/explain
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "question_text": "What is the pathophysiology of hypertension?",
  "topic": "Cardiovascular Nursing",
  "difficulty": "hard"
}
```

**Success Response (200):**
```json
{
  "question": "Explain the pathophysiology of hypertension",
  "options": {
    "A": "Increased peripheral resistance...",
    "B": "Decreased cardiac output...",
    "C": "Both A and B",
    "D": "Neither A nor B"
  },
  "correct_answer": "C",
  "explanation": "Hypertension results from... [detailed explanation]"
}
```

---

## Exams Endpoints

### Start CBT Exam
```
POST /exams/cbt/start
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "topic_id": 1,
  "limit": 50
}
```

**Success Response (200):**
```json
{
  "duration": 3600,
  "questions": [
    {
      "id": 1,
      "question": "Question text...",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      }
    }
  ]
}
```

### Submit CBT Exam
```
POST /exams/cbt/submit
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "exam_id": 1,
  "answers": [
    {
      "question_id": 1,
      "answer": "A"
    },
    {
      "question_id": 2,
      "answer": "C"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "Exam submitted successfully",
  "score": 18,
  "total": 20,
  "percentage": 90,
  "result": {
    "id": 1,
    "user_id": 1,
    "score": 18,
    "total": 20,
    "percentage": 90,
    "created_at": "2024-01-31T10:30:00Z"
  }
}
```

### Get Clinical Exams
```
GET /exams/clinical/:topicId
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "question": "Clinical scenario: A 45-year-old patient presents with..."
  }
]
```

---

## Payments Endpoints

### Initiate Payment
```
POST /payments/initiate
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 5000
}
```

**Success Response (200):**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "xxxxx",
  "reference": "ref_12345"
}
```

### Verify Payment
```
GET /payments/verify/:reference
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Subscription activated successfully",
  "expiry": "2025-02-28T00:00:00Z",
  "status": "success"
}
```

### Check Payment Status
```
GET /payments/status/:reference
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "reference": "ref_12345",
  "amount": 500000,
  "status": "success",
  "paid_at": "2024-01-31T10:30:00Z"
}
```

---

## Users Endpoints

### Get User Profile
```
GET /users/profile
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "subscription_expiry": "2025-02-28T00:00:00Z",
  "created_at": "2024-01-15T00:00:00Z"
}
```

### Update User Profile
```
PUT /users/profile
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "full_name": "John Doe Jr",
  "phone": "+234812345678"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated",
  "user": {
    "id": 1,
    "full_name": "John Doe Jr",
    "email": "john@example.com",
    "phone": "+234812345678"
  }
}
```

### Get Exam History
```
GET /users/exam-history
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "exam_id": 5,
    "score": 45,
    "total": 50,
    "percentage": 90,
    "created_at": "2024-01-30T15:30:00Z"
  }
]
```

---

## Curriculum Endpoints

### Get All Topics
```
GET /curriculum/topics
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "title": "Anatomy",
    "category": "Foundation",
    "description": "Basic human anatomy..."
  }
]
```

### Get Topics by Category
```
GET /curriculum/category/:category
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "title": "Anatomy",
    "category": "Foundation",
    "description": "Basic human anatomy..."
  }
]
```

### Get Single Topic
```
GET /curriculum/:topicId
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Anatomy",
  "category": "Foundation",
  "description": "Basic human anatomy..."
}
```

### Create Topic (Admin Only)
```
POST /curriculum/
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "New Topic",
  "category": "Clinical",
  "description": "Topic description"
}
```

**Success Response (201):**
```json
{
  "message": "Topic created",
  "topic": {
    "id": 10,
    "title": "New Topic",
    "category": "Clinical",
    "description": "Topic description"
  }
}
```

---

## Admin Endpoints

### Create Subject
```
POST /admin/subjects
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Medical Surgical Nursing",
  "category": "Clinical",
  "description": "Care of patients with medical and surgical conditions"
}
```

**Success Response (201):**
```json
{
  "message": "Subject added",
  "subject": {
    "id": 1,
    "name": "Medical Surgical Nursing",
    "category": "Clinical",
    "description": "Care of patients with medical and surgical conditions"
  }
}
```

### Get All Subjects
```
GET /admin/subjects
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Medical Surgical Nursing",
    "category": "Clinical",
    "description": "..."
  }
]
```

### Generate AI Course
```
POST /admin/generate-course
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Advanced Pharmacology",
  "category": "Pharmacology",
  "description": "Advanced drug interactions and therapeutics"
}
```

**Success Response (201):**
```json
{
  "message": "Course generated successfully",
  "course": {
    "id": 1,
    "title": "Advanced Pharmacology",
    "category": "Pharmacology",
    "description": "Advanced drug interactions and therapeutics"
  },
  "aiContent": {
    "modules": [...],
    "objectives": [...]
  }
}
```

### Delete Subject
```
DELETE /admin/subjects/:id
Headers: Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Subject deleted successfully"
}
```

---

## Admin AI Questions Endpoints

### Generate Multiple Questions
```
POST /admin/ai-questions/generate
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "topic_id": 1,
  "type": "mcq",
  "difficulty": "hard",
  "count": 10
}
```

**Success Response (201):**
```json
{
  "message": "Generated 10/10 questions",
  "generated": [...],
  "summary": {
    "total": 10,
    "successful": 10,
    "failed": 0
  }
}
```

### Generate Single Question
```
POST /admin/ai-questions/generate-one
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "topic_id": 1,
  "type": "mcq",
  "difficulty": "medium"
}
```

**Success Response (201):**
```json
{
  "message": "Question generated",
  "question": {
    "id": 100,
    "question": "What is...",
    "options": {...},
    "correct_answer": "B",
    "explanation": "..."
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": "Field 'email' is required"
}
```

### 401 Unauthorized
```json
{
  "error": "No authorization token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Admin privileges required"
}
```

### 404 Not Found
```json
{
  "error": "Topic not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch data"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get questions (with token)
curl -X GET http://localhost:5000/api/questions/1 \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Import the API endpoints
2. Set `{{baseUrl}}` = `http://localhost:5000/api`
3. Use token from login response in Authorization header
4. Test each endpoint
