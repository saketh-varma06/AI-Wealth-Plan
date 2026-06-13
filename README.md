# 💰 AI Wealth Planner

> **Smart Expense, Savings, Investment & Financial Intelligence System**

A full-stack AI-powered financial planning web application built with the MERN stack. Features intelligent expense tracking, goal-based savings planning, investment portfolio management, gamification, and an AI financial advisor.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, Google OAuth 2.0 |
| **Deployment** | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

---

## ✨ Features

### 🔐 Authentication
- Email/password login & registration
- Google OAuth login
- JWT-based protected routes
- Forgot / Reset password via email

### 📋 Onboarding
- Multi-step financial profile setup
- Income, fixed expenses, savings goals

### 📊 Dashboard
- Health score (0–100)
- Income vs expenses vs savings cards
- Pie chart: expenses by category
- Line chart: 6-month spending trend
- Gamification: level, XP, streak badges

### 💸 Expense Tracker
- Add / edit / delete expenses
- Upload bill photos
- Filter by category, date range, search
- Pagination

### 🎯 Purchase Goal Planner
- Set a product + price + target date
- AI calculates monthly/daily savings needed
- Achievability score & alternative plans
- Contribution tracker with progress bar
- Purchase impact analysis

### 📈 Investment Intelligence
- Portfolio tracker (stocks, MF, SIP, FD, gold, crypto)
- Allocation pie chart
- Market educational watchlist
- SIP fund suggestions
- Gain/loss tracking

### 🤖 AI Financial Advisor
- Personalized spending analysis
- Budget recommendations (50/30/20 rule)
- Financial health score breakdown
- Category-wise spending breakdown

### 📄 Reports
- Monthly summaries
- CSV export
- Category bar + pie charts
- Goals progress table

### 🏆 Gamification
- XP points on every action
- Level progression
- Achievement badges
- Savings streak

### 🔔 Notifications
- Overspending alerts
- Goal completion notifications
- Achievement unlocks
- Real-time notification panel

### 🛡️ Admin Panel
- Platform statistics
- User growth chart
- User management + role assignment

### 🔒 Security
- bcrypt password hashing
- JWT tokens
- Helmet.js headers
- Rate limiting (express-rate-limit)
- Input validation
- CORS protection

---

## 📁 Project Structure

```
AI-Wealth-Planner/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── pages/              # Login, Dashboard, Expenses, Goals, etc.
│   │   ├── components/         # Reusable UI components
│   │   ├── layouts/            # AppLayout (sidebar), AuthLayout
│   │   ├── context/            # AuthContext
│   │   ├── services/           # Axios API service layer
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Helper functions
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Express backend
│   ├── controllers/            # Route handler logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Auth, error handler
│   ├── services/               # AI logic, email
│   ├── config/                 # DB connection
│   └── server.js
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud Console project (for OAuth)
- Gmail account (for password reset emails)

---

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-wealth-planner.git
cd ai-wealth-planner
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ai-wealth-planner
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/user/onboarding` | Save financial profile |
| GET | `/api/user/dashboard-stats` | Get dashboard data |
| GET | `/api/expenses` | List expenses (paginated, filtered) |
| POST | `/api/expenses` | Add expense (with file upload) |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal + AI analysis |
| POST | `/api/goals/:id/contribute` | Add saving contribution |
| GET | `/api/goals/:id/impact` | Purchase impact analysis |
| GET | `/api/investments` | List investments |
| POST | `/api/investments` | Add investment |
| GET | `/api/investments/watchlist` | Market watchlist |
| GET | `/api/reports/data` | Monthly report |
| GET | `/api/reports/csv` | Download CSV |
| GET | `/api/notifications` | List notifications |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/admin/users` | All users |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Set root directory to `client`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`
5. Deploy

### Backend → Render

1. Connect repo to [render.com](https://render.com)
2. Create a **Web Service**, root directory = `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `server/.env`
6. Set `CLIENT_URL` to your Vercel URL

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy connection string to `MONGODB_URI`

---

## 🔑 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API** and **OAuth 2.0**
4. Create OAuth credentials (Web Application)
5. Add authorized origins:
   - `http://localhost:5173`
   - `https://your-vercel-app.vercel.app`
6. Copy Client ID to both `.env` files

---

## 📧 Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a 16-character app password
4. Use it as `EMAIL_PASS` in server `.env`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push and open a Pull Request

---

## 📜 License

MIT License — free to use for personal and commercial projects.

---

**Built with ❤️ using the MERN stack + AI-powered financial intelligence**
