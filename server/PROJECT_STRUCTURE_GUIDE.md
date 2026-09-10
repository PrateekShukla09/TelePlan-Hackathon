# AI-Powered Telecom Tariff Plan Recommendation System
## Backend Project Structure & Team Architecture Guide

This document provides a comprehensive breakdown of every folder and file in the backend core repository. It is designed to help team members, frontend developers, and AI/Chatbot engineers understand the responsibility of each component and how to integrate with the backend.

---

## 🏛 1. High-Level Architecture Overview

```text
Customer Telemetry / Profile Input
                ↓
    Express REST API Routes & Middlewares
                ↓
     Controllers (HTTP Request Handling)
                ↓
Recommendation Engine Service (Multi-Factor Scoring)
                ↓
       Mongoose Models (MongoDB Atlas)
```

### Core Backend Responsibilities
1. **Customer Management**: Serving customer details and telemetry breakdown.
2. **Plan Catalogue**: Full CRUD management of available tariff plans.
3. **Recommendation Engine**: Deterministic multi-factor scoring algorithm ($dataFit, callFit, smsFit, budgetFit, roamingMatch$).
4. **Recommendation APIs**: Exposing `/api/recommendations/by-customer/:id` and `/api/recommendations/by-profile`.
5. **Security & Validation**: JWT Authentication for admin features, Rate limiting, Helmet security headers, CORS restriction, and Zod input validation.

---

## 📁 2. Complete Folder & File Directory Guide

```text
server/
│
├── src/                          # Application source code
│   ├── config/                   # Global configuration modules
│   │   ├── db.js                 # MongoDB Atlas connection handler
│   │   ├── env.js                # Environment variable loader
│   │   └── swagger.js            # Swagger/OpenAPI documentation setup
│   │
│   ├── models/                   # Mongoose database schemas & models
│   │   ├── Customer.js           # Customer schema & telemetry definition
│   │   ├── Plan.js               # Tariff plan catalogue schema
│   │   └── Recommendation.js     # Audit log schema for recommendations
│   │
│   ├── routes/                   # Express API route endpoints
│   │   ├── auth.js               # Admin authentication route (/api/auth)
│   │   ├── customers.js          # Customer management routes (/api/customers)
│   │   ├── plans.js              # Plan management routes (/api/plans)
│   │   └── recommendations.js    # Recommendation engine routes (/api/recommendations)
│   │
│   ├── controllers/              # Request handlers & HTTP response logic
│   │   ├── authController.js     # Handles admin login & JWT token creation
│   │   ├── customerController.js # Handles fetching customer usage & details
│   │   ├── planController.js     # Handles plan list & admin CRUD operations
│   │   └── recommendationController.js # Handles recommendation endpoints
│   │
│   ├── services/                 # Business logic & core algorithms
│   │   └── recommendationEngine.js # Multi-factor plan scoring algorithm
│   │
│   ├── middleware/               # Express request pipeline middleware
│   │   ├── auth.js               # JWT Bearer token authentication check
│   │   ├── validate.js           # Zod schema validation middleware
│   │   ├── rateLimiter.js        # API rate limiters (general & recommendation)
│   │   └── errorHandler.js       # Centralized error handler
│   │
│   ├── utils/                    # Utility helper functions & error classes
│   │   └── errors.js             # Custom AppError class definition
│   │
│   ├── app.js                    # Express app initialization & middleware configuration
│   └── server.js                 # HTTP server bootstrap entry point
│
├── tests/                        # Automated Jest & Supertest test suite
│   ├── recommendationEngine.test.js # Recommendation engine scoring unit tests
│   ├── customers.test.js         # Customer API integration tests
│   ├── plans.test.js             # Plan API integration tests
│   ├── recommendations.test.js   # Recommendation API integration tests
│   └── auth.test.js              # Admin authentication API tests
│
├── scripts/                      # Database scripts & CLI utilities
│   ├── seed.js                   # Database seed script for MongoDB Atlas
│   ├── seedAdmin.js              # Admin credentials helper script
│   └── importCustomers.js        # CSV customer dataset importer script
│
├── .env                          # Local environment secrets (NOT committed to Git)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore file rules
├── Dockerfile                    # Docker build configuration for production
├── docker-compose.yml            # Docker Compose configuration for container orchestration
├── package.json                  # Node.js dependencies and run scripts
└── README.md                     # Project quick start & documentation
```

---

## 🔍 3. Detailed File Breakdown

### ⚙️ `src/config/` (Configuration)
- **`env.js`**: Loads and validates environment variables from `.env` (Port, MongoDB URI, JWT Secret, Admin credentials, Client URL).
- **`db.js`**: Establishes a Mongoose connection to MongoDB Atlas with connection error handling and fallback support.
- **`swagger.js`**: Generates interactive Swagger OpenAPI 3.0 documentation served at `/api-docs`.

---

### 🗄 `src/models/` (Database Schemas)
- **`Customer.js`**: Defines customer telemetry schema (`name`, `phone`, `tenureMonths`, `contractType`, `usage: { avgCallMin, dataGB, smsCount, dayEveningNightSplit, roamingUsage, internationalUsage }`, `currentPlanId`).
- **`Plan.js`**: Defines tariff plan schema (`planName`, `price`, `dataGB`, `callMinutes`, `sms`, `roamingIncluded`, `validityDays`, `sourceOperatorRef`).
- **`Recommendation.js`**: Audit log schema storing generated recommendation records (`customerId`, `sessionId`, `recommendedPlans: [{ planId, score, explanation }]`, `source`, `generatedAt`).

---

### 🛣 `src/routes/` (API Route Definitions)
- **`auth.js`**: Defines POST `/api/auth/login`.
- **`customers.js`**: Defines GET `/api/customers/:id` and GET `/api/customers/:id/usage`.
- **`plans.js`**: Defines GET `/api/plans` (public) and POST/PUT/DELETE `/api/plans` (admin protected).
- **`recommendations.js`**: Defines POST `/api/recommendations/by-customer/:id` and POST `/api/recommendations/by-profile`.

---

### 🎮 `src/controllers/` (HTTP Request Processing)
- **`authController.js`**: Validates admin credentials against `ADMIN_USERNAME` / `ADMIN_PASSWORD` (bcrypt hashed) and signs JWT tokens.
- **`customerController.js`**: Fetches customer profiles and usage telemetry from MongoDB using lean queries.
- **`planController.js`**: Manages listing plans with query filters (`minPrice`, `maxPrice`, `roamingIncluded`, `page`, `limit`) and admin CRUD operations.
- **`recommendationController.js`**: Invokes the recommendation engine service for existing customers or profile payloads and records audit logs in MongoDB.

---

### 🧮 `src/services/` (Core Business Logic)
- **`recommendationEngine.js`**: The central deterministic scoring algorithm of the project.
  - **`calculateDataFit(planDataGB, dataNeed)`**: Scores data allowance fit (0 to 1).
  - **`calculateCallFit(planCallMin, callingNeed)`**: Scores call minutes fit (0 to 1).
  - **`calculateSmsFit(planSms, smsNeed)`**: Scores SMS count fit (0 to 1).
  - **`calculateBudgetFit(planPrice, budget)`**: Scores price vs. budget with smooth overspend penalty (0 to 1).
  - **`calculateRoamingMatch(planRoamingIncluded, roamingRequired)`**: Scores roaming availability (0 to 1).
  - **`calculateScore(plan, profile)`**: Computes weighted sum ($0.30 \cdot \text{data} + 0.20 \cdot \text{calls} + 0.15 \cdot \text{sms} + 0.20 \cdot \text{budget} + 0.15 \cdot \text{roaming}$).
  - **`getTopRecommendations(plans, profile)`**: Sorts plans descending and returns the top 3 recommendations.
  - **`customerToRecommendationProfile(customer)`**: Converts customer telemetry into standard requirement profiles.

---

### 🛡 `src/middleware/` (Pipeline Guardrails)
- **`auth.js`**: Checks `Authorization: Bearer <token>`, verifies JWT signature, and attaches `req.user`.
- **`validate.js`**: Validates request parameters or body using Zod schemas.
- **`rateLimiter.js`**: Prevents abuse by limiting request rates (general API rate limit + stricter recommendation rate limit).
- **`errorHandler.js`**: Catches unhandled errors and returns standardized JSON error responses.

---

### 🛠 `src/utils/` (Utilities)
- **`errors.js`**: Contains the custom `AppError` class with standardized HTTP status codes and error codes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `CUSTOMER_NOT_FOUND`, etc.).

---

### 🚀 `src/app.js` & `src/server.js`
- **`app.js`**: Assembles Express middleware (Helmet, CORS, Morgan, Body Parser, Rate Limiter), mounts routes, and sets up centralized error handling.
- **`server.js`**: Starts the HTTP server on `process.env.PORT` and initializes MongoDB connection.

---

### 🧪 `tests/` (Test Suite)
- **`recommendationEngine.test.js`**: Unit tests verifying factor scoring functions, weighted sums, edge cases (zero budget, high budget, 0/1/2/many plans).
- **`customers.test.js`**: Integration tests for customer lookup endpoints.
- **`plans.test.js`**: Integration tests for public plan listing and admin JWT-protected plan endpoints.
- **`recommendations.test.js`**: Integration tests for customer and profile recommendation endpoints.
- **`auth.test.js`**: Integration tests for admin login and token verification.

---

### 📜 `scripts/` (Database & Utility Scripts)
- **`seed.js`**: Populates MongoDB Atlas with 6 realistic tariff plans and 25 telecom customers across various usage tiers.
- **`seedAdmin.js`**: Prints admin credentials and bcrypt hashes for configuration.
- **`importCustomers.js`**: CLI utility for parsing customer usage CSV files, validating rows, upserting valid records, and reporting execution metrics.

---

## 🤝 4. Team Integration Guide

### For the Chatbot / AI Developer
Your responsibility is to take conversational text from the user, extract their requirement profile using Claude/LLM, and call the backend recommendation endpoint:

- **Endpoint**: `POST /api/recommendations/by-profile`
- **Request Payload**:
```json
{
  "profile": {
    "dataNeed": "high",
    "callingNeed": "medium",
    "smsNeed": "low",
    "budget": 700,
    "roamingRequired": true,
    "familyOrIndividual": "individual"
  }
}
```
- **Response**: Returns the top 3 best matching plans with calculated match scores (`0.00` to `1.00`). You can then append your AI-generated explanations before presenting them to the user.

---

### For Frontend Developers
- **Base URL**: `http://localhost:5000` (or production URL)
- **Swagger Docs**: View interactive documentation at `http://localhost:5000/api-docs`
- **Authentication**: Include `Authorization: Bearer <token>` for admin plan management APIs (`POST`, `PUT`, `DELETE` on `/api/plans`).

---

## ⛔️ 5. Explicit Scope Boundaries (Out of Backend Core Scope)

To prevent duplication of work, the following features are **NOT** implemented in this backend core:
- ❌ Claude / Anthropic SDK / LLM integration
- ❌ Chatbot session management
- ❌ Voyage AI / Vector Embeddings / RAG
- ❌ MongoDB Atlas Vector Search
- ❌ K-Means Clustering / Cluster Models / Batch Jobs

The backend core focuses entirely on reliable customer telemetry management, plan catalogue handling, deterministic scoring, and secure REST APIs.
