# 🏥 Kingsbal Digital Healthcare Bridge - Enterprise Edition

## Overview

Kingsbal is a modern, enterprise-grade digital healthcare platform for nursing and midwifery education. This edition includes a comprehensive design system, beautiful UI components, complete legal compliance pages, and full social media integration.

## ✨ Features

### 🎨 Design System
- **Modern Typography**: Poppins (primary) + Inter (secondary) fonts imported from Google Fonts
- **Enterprise Color Palette**: 
  - Primary: #0066ff (Blue)
  - Secondary: #10b981 (Green)
  - Dark: #0f172a (Slate)
  - Grays: Multiple shades for hierarchy
  - Functional: Success, Warning, Error, Info colors
- **Component Library**: Pre-built styles for buttons, cards, forms, tables, badges, alerts
- **Shadow System**: 4-tier shadow hierarchy (sm/md/lg/xl)
- **Responsive Grid System**: 2, 3, 4-column grids with auto-fit
- **Animations**: Smooth transitions and hover effects

### 🌐 Pages & Components
1. **Dashboard**: Premium redesigned dashboard with:
   - User stats cards (exams taken, avg score, streak, questions solved)
   - Quick action cards (practice questions, mock exams, analytics, resources, plans, settings)
   - Recent activity timeline
   - Smooth hover animations and transitions

2. **Authentication Pages**:
   - Login (modern card-based design)
   - Register (comprehensive form with validation)
   - HttpOnly cookie-based security

3. **Legal & Compliance**:
   - **Terms of Service** (`/terms`): 9-section comprehensive legal document
   - **Privacy Policy** (`/privacy`): GDPR/CCPA-compliant privacy terms
   - **Contact Page** (`/contact`): Contact form + social media directory

4. **Subscription Page** (`/subscribe`):
   - Updated pricing: ₦1,200 for 6 months (not per-user/month)
   - Paystack payment integration
   - Clear feature list

5. **Footer Component**:
   - Dark gradient background (enterprise design)
   - Quick navigation links
   - Social media handles (configurable via environment variables)
   - Copyright information

6. **Watermark Background**:
   - Fixed-position faded overlay
   - Text: "kingsbalfx&healthcare digital bridge"
   - Non-intrusive (pointerEvents: none)
   - 50% opacity for subtle branding

### 📱 Social Media Integration
All social media links are configurable via environment variables:
- WhatsApp (primary contact channel)
- Twitter/X
- Facebook
- Instagram
- LinkedIn
- YouTube

Set in `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/2347000000000
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/kingsbalfx
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/kingsbalfx
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/kingsbalfx
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/kingsbalfx
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/c/kingsbalfx
```

## 🏗️ Architecture

### Frontend (Next.js 13)
```
web/
├── pages/
│   ├── index.js           # Home page
│   ├── dashboard.js       # Premium dashboard
│   ├── login.js           # Login page
│   ├── register.js        # Registration page
│   ├── subscribe.js       # Subscription page (₦1,200/6mo)
│   ├── terms.js           # Terms of Service
│   ├── privacy.js         # Privacy Policy
│   ├── contact.js         # Contact form & directory
│   └── admin/             # Admin pages
├── components/
│   ├── Layout.js          # Main layout with Watermark + Footer
│   ├── Navbar.js          # Navigation bar
│   ├── ProtectedRoute.js  # Auth guard
│   ├── Watermark.js       # Background watermark
│   └── Footer.js          # Footer with social links
├── services/
│   └── api.js             # Axios client with auth
├── styles/
│   └── globals.css        # 700+ lines design system
└── .env.local             # Environment config
```

### Backend (Express.js 5)
```
backend/
├── src/
│   ├── server.js          # Express server setup
│   ├── modules/
│   │   ├── auth/          # Authentication (JWT + HttpOnly cookies)
│   │   ├── payments/      # Paystack integration
│   │   ├── contact/       # Contact form handling
│   │   ├── questions/     # Question bank
│   │   ├── exams/         # Exam management
│   │   ├── users/         # User management
│   │   ├── admin/         # Admin panel
│   │   └── curriculum/    # Curriculum data
│   └── middleware/        # Auth, error handling
└── .env                   # Backend environment config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- PostgreSQL (via Supabase)

### Installation

**1. Clone or download the repository**
```bash
cd kingsbal_digital_healthcare_bridge
```

**2. Setup Backend**
```bash
cd backend
npm install
# Configure .env with database credentials and Paystack keys
npm run dev
```

**3. Setup Frontend**
```bash
cd ../web
npm install
# Copy .env.example to .env.local and update social media URLs
npm run dev
```

**4. Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin: http://localhost:3000/admin (after login)

### Demo Credentials (Demo Mode)
```
Email: demo@kingsbal.com
Password: password123
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (sets HttpOnly cookie)
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Contact
- `POST /api/contact` - Submit contact form

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

### Questions
- `GET /api/questions` - Get questions (paginated)
- `GET /api/questions/:id/explain` - Get question explanation

### Exams
- `POST /api/exams/create` - Create mock exam
- `POST /api/exams/:id/submit` - Submit exam answers

## 🔐 Security Features

### Authentication
- **HttpOnly Cookies**: Secure token storage
- **CSRF Protection**: Token-based verification
- **Password Hashing**: Bcrypt (12 rounds)
- **JWT Tokens**: 7-day expiration

### API Security
- CORS configured for localhost development
- Request validation middleware
- Error logging without sensitive data
- Rate limiting ready (commented, can enable)

## 🎨 Styling

### Global CSS Classes

**Buttons**
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
```

**Cards**
```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**Grid System**
```html
<div class="grid grid-2"><!-- 2 columns --></div>
<div class="grid grid-3"><!-- 3 columns --></div>
<div class="grid grid-4"><!-- 4 columns --></div>
```

**Spacing Utilities**
```html
<!-- Margins: mt-1, mt-2, mt-3, etc. -->
<!-- Padding: p-1, p-2, p-3, etc. -->
<!-- Gaps: gap-1, gap-2, gap-3, etc. -->
```

## 📊 Dashboard Features

The premium dashboard includes:
- **User Stats**: Exams taken, average score, current streak, questions solved
- **Quick Actions**: 6 action cards with hover effects:
  - Browse Question Bank
  - Take Mock Exam
  - View Analytics
  - Study Resources
  - Upgrade Plan
  - Account Settings
- **Recent Activity**: Timeline of recent user actions
- **Responsive Design**: Works on all screen sizes
- **Hover Animations**: Smooth transitions and scale effects

## 💳 Pricing Model

- **Price**: ₦1,200
- **Duration**: 6 months
- **Features**:
  - Full access to question banks
  - Practice exams and progress tracking
  - Student-friendly resources and explanations
  - Performance analytics and recommendations

## 📱 Social Media Integration

All social links are configurable. Update `.env.local`:

```env
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/YOUR_NUMBER
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/your_handle
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/your_page
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/your_handle
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/your_company
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/c/your_channel
```

## 🧪 Testing

**Run Backend Tests**
```bash
cd backend
node scripts/smoke_test.js    # Health checks
node scripts/e2e_test.js      # Full auth + payment flow
```

**Manual Testing Checklist**
```
☐ Login/Register with new account
☐ View Dashboard (all stats visible)
☐ Click all Quick Action cards
☐ Navigate to Terms/Privacy/Contact
☐ Submit Contact Form
☐ Test all social media links in Footer
☐ Subscribe and initiate payment
☐ Check Watermark background (visible, not intrusive)
☐ Test responsive on mobile (< 768px)
```

## 📝 License

© 2026 Kingsbal Digital Healthcare Bridge. All rights reserved.

## 🆘 Support

- Email: support@kingsbal.com
- WhatsApp: [Your WhatsApp Link]
- Contact Form: http://localhost:3000/contact

## 🔄 Deployment

### Vercel (Frontend)
```bash
cd web
vercel deploy
```

### Railway/Render (Backend)
```bash
cd backend
# Deploy with environment variables:
# - DATABASE_URL (Supabase)
# - PAYSTACK_PUBLIC_KEY
# - PAYSTACK_SECRET_KEY
# - JWT_SECRET
# - NODE_ENV=production
```

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
