# AI-Powered Telecom Tariff Plan Recommendation System - Backend Core

Production-ready Express.js & MongoDB backend delivering automated telecom tariff recommendations using deterministic multi-factor scoring based on customer telemetry and requirement profiles.

---

## 🏗 Architecture & Features

### Core Capabilities
- **Deterministic Recommendation Engine**: Multi-factor scoring ($dataFit, callFit, smsFit, budgetFit, roamingMatch$) with configurable weights ($0.30, 0.20, 0.15, 0.20, 0.15$).
- **Customer Management**: Endpoints for fetching customer details and granular usage telemetry.
- **Plan Catalogue**: Complete plan management with pagination, price filters, roaming filters, and admin CRUD endpoints.
- **Profile Recommendation API**: Clean `/api/recommendations/by-profile` endpoint ready for future Chatbot & LLM integration.
- **Security & Reliability**: Helmet HTTP headers, CORS restriction (`CLIENT_URL`), Express Rate Limiting, JWT admin authentication, Zod input validation, and centralized error handling with custom error codes.
- **Database Seeding & CSV Import**: Scripts for seeding database with sample telecom data and importing customer usage CSV files.

> [!NOTE]
> All AI APIs (Claude/LLM, Voyage AI), RAG, Vector Search, and K-Means Clustering have been intentionally removed from the backend core scope.

---

## 🚀 Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas / local connection URI | `mongodb://127.0.0.1:27017/tariff_recommender` |
| `JWT_SECRET` | Secret key used for signing admin JWT tokens | `super-secret-jwt-key-tariff-recommender-2026` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `adminpassword123` |
| `NODE_ENV` | Environment state (`development`, `production`, `test`) | `development` |
| `CLIENT_URL` | Allowed frontend client URL for CORS policy | `http://localhost:5173` |

---

## 📦 Installation & Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Seed the database with sample tariff plans and customers:
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```

Server will run at: `http://localhost:5000`  
Swagger documentation at: `http://localhost:5000/api-docs`

### 4. Run Production Server
```bash
npm start
```

---

## 🧪 Testing

Run unit tests for recommendation engine and integration tests for all API routes:
```bash
npm test
```

---

## 📊 CSV Customer Import

Import raw customer telemetry CSV files:
```bash
npm run import:customers ./path/to/customers.csv
```

Outputs execution summary: Total Records, Inserted, Updated, Invalid, and Skipped counts.

---

## 🐳 Docker Deployment

Run MongoDB and Backend using Docker Compose:
```bash
docker-compose up --build
```

---

## 📖 API Summary

- **Health Check**: `GET /api/health`
- **Swagger Docs**: `GET /api-docs`
- **Admin Auth**: `POST /api/auth/login`
- **Customers**: `GET /api/customers/:id`, `GET /api/customers/:id/usage`
- **Plans**: `GET /api/plans`, `POST /api/plans` (Admin), `PUT /api/plans/:id` (Admin), `DELETE /api/plans/:id` (Admin)
- **Recommendations**: `POST /api/recommendations/by-customer/:id`, `POST /api/recommendations/by-profile`
