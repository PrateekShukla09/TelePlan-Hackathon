# AI-Powered Telecom Tariff Plan Recommendation System
## Complete Backend Technical Architecture, File-by-File Guide & Presentation Q&A Documentation

---

## 📋 Executive Table of Contents
1. **System Overview & Architectural Philosophy**
2. **End-to-End Execution Flow & Request Lifecycle**
3. **Recommendation Engine Mathematical Scoring Model**
4. **Comprehensive File-by-File Breakdown (All Files & Folders)**
5. **Security, Validation & Error Handling Architecture**
6. **Top 10 Project Presentation & Viva Defense Questions (With Answers)**

---

## 🏛 1. System Overview & Architectural Philosophy

The **AI-Powered Telecom Tariff Plan Recommendation System** backend is a production-grade Node.js/Express REST API connected to MongoDB Atlas. It evaluates telecom customer usage telemetry and user preference profiles against available tariff plans to compute match scores ($0.00$ to $1.00$) and deliver the **Top 3 optimal tariff recommendations**.

### Key Architectural Decisions:
1. **Deterministic Core Engine**: Tariff scoring is calculated using a transparent, deterministic mathematical model ($dataFit, callFit, smsFit, budgetFit, roamingMatch$). This ensures zero hallucination, sub-millisecond calculation speeds, and 100% testable business logic.
2. **Stable AI Handoff Contract**: Exposes `POST /api/recommendations/by-profile`. This enables future Chatbot/LLM developers (e.g., Anthropic Claude / OpenAI) to extract user preferences, call this API for deterministic scoring, and append natural language AI explanations to the top plans.
3. **Clustering & Heavy Dependency Scope Removal**: K-Means clustering and heavy ML batch jobs were explicitly removed in favor of direct multi-factor scoring. This eliminates unnecessary memory overhead, prevents batch job synchronization delays, and keeps the API completely independent of external paid API keys.

---

## 🔄 2. End-to-End Execution Flow & Request Lifecycle

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT LAYER                                    │
│             React Frontend / Mobile App / Chatbot AI Orchestrator               │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ HTTP Requests (JSON)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               SECURITY & PIPELINE                               │
│       Helmet (HTTP Headers) ──► CORS Policy ──► Rate Limiter (/api/rec: 30/min)  │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 EXPRESS ROUTER                                  │
│   /api/auth       │    /api/customers    │    /api/plans    │ /api/recommendations│
└─────────┬──────────────────────┬───────────────────┬───────────────────┬────────┘
          │                      │                   │                   │
          ▼                      ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               CONTROLLER LAYER                                  │
│   authController  │ customerController  │  planController  │recController       │
└────────────────────────────────────────────────────────────────────────┬────────┘
                                                                         │
                                                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                SERVICE LAYER                                    │
│                       src/services/recommendationEngine.js                      │
│      - calculateDataFit()            - calculateBudgetFit()                     │
│      - calculateCallFit()            - calculateRoamingMatch()                  │
│      - calculateSmsFit()             - calculateScore() & getTopRecommendations() │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ Read Plans / Write Audit Logs
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE LAYER                                    │
│                      MongoDB Atlas (tariff_recommender)                         │
│           collections: customers  │  plans  │  recommendations                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Complete Request Lifecycle (Step-by-Step)

```text
[1. HTTP Request] -> [2. Helmet Headers] -> [3. CORS Check] -> [4. Rate Limiter]
                                                                      │
[8. JSON Response] <- [7. Audit Log Saved] <- [6. Top 3 Scored] <- [5. Controller Route]
```

1. **Client Request**: A client (Frontend or Chatbot) sends an HTTP POST request to `/api/recommendations/by-profile`.
2. **Security Pipeline**:
   - `helmet()` injects protective HTTP headers (XSS Protection, HSTS, No-Sniff).
   - `cors()` verifies the request origin against `CLIENT_URL`.
   - `recommendationLimiter` checks if the requesting IP has exceeded 30 requests/minute.
3. **Route & Middleware Parsing**: `express.json()` parses the JSON body, and the router forwards the request to `recommendationController.recommendByProfile`.
4. **Validation**: The controller verifies that a valid `profile` object is attached.
5. **Database Lookup**: Queries MongoDB Atlas (`Plan.find({}).lean()`) to retrieve all available tariff plans.
6. **Scoring Engine Service**: Passes the plan catalogue and profile to `getTopRecommendations()` in `recommendationEngine.js`.
7. **Score Evaluation**: The engine computes weighted factor scores for every plan, sorts them descending, and selects the Top 3 plans.
8. **Audit Logging**: The controller asynchronously logs an audit record in the `recommendations` collection in MongoDB Atlas.
9. **JSON Response**: Returns HTTP `200 OK` with the top 3 plans and their numeric match scores.

---

## 🧮 3. Recommendation Engine Mathematical Scoring Model

The scoring engine evaluates each plan against a user profile using five normalized factors (each between $0.00$ and $1.00$).

### 1. Factor Calculations

#### A. Data Fit ($\text{dataFit}$)
$$\text{Required GB} = \begin{cases} 5 & \text{if dataNeed} = \text{'low'} \\ 15 & \text{if dataNeed} = \text{'medium'} \\ 30 & \text{if dataNeed} = \text{'high'} \\ N & \text{if numeric } N \end{cases}$$

$$\text{dataFit} = \begin{cases} 1.0 & \text{if Required} \le 0 \\ \max\left(0.8, 1.0 - \frac{\text{PlanData} - \text{Required}}{4 \cdot \text{Required}}\right) & \text{if PlanData} \ge \text{Required} \\ \max\left(0.0, \frac{\text{PlanData}}{\text{Required}}\right) & \text{if PlanData} < \text{Required} \end{cases}$$

*Rationale*: Plans meeting the data requirement get high scores ($0.80$ to $1.00$). Oversized plans receive a mild penalty so users aren't pushed to buy unnecessarily huge, expensive data packages.

#### B. Call Fit ($\text{callFit}$)
$$\text{Required Call Minutes} = \begin{cases} 200 & \text{if callingNeed} = \text{'low'} \\ 800 & \text{if callingNeed} = \text{'medium'} \\ 1500 & \text{if callingNeed} = \text{'high'} \end{cases}$$

$$\text{callFit} = \begin{cases} \max\left(0.8, 1.0 - \frac{\text{PlanCalls} - \text{Required}}{4 \cdot \text{Required}}\right) & \text{if PlanCalls} \ge \text{Required} \\ \max\left(0.0, \frac{\text{PlanCalls}}{\text{Required}}\right) & \text{if PlanCalls} < \text{Required} \end{cases}$$

#### C. SMS Fit ($\text{smsFit}$)
$$\text{Required SMS} = \begin{cases} 50 & \text{if smsNeed} = \text{'low'} \\ 200 & \text{if smsNeed} = \text{'medium'} \\ 500 & \text{if smsNeed} = \text{'high'} \end{cases}$$

$$\text{smsFit} = \begin{cases} \max\left(0.8, 1.0 - \frac{\text{PlanSMS} - \text{Required}}{4 \cdot \text{Required}}\right) & \text{if PlanSMS} \ge \text{Required} \\ \max\left(0.0, \frac{\text{PlanSMS}}{\text{Required}}\right) & \text{if PlanSMS} < \text{Required} \end{cases}$$

#### D. Budget Fit ($\text{budgetFit}$)
$$\text{budgetFit} = \begin{cases} 0.8 & \text{if Budget is unspecified/null} \\ \min\left(1.0, 0.9 + 0.1 \cdot \frac{\text{Budget} - \text{PlanPrice}}{\text{Budget}}\right) & \text{if PlanPrice} \le \text{Budget} \\ \max\left(0.0, 1.0 - 1.5 \cdot \frac{\text{PlanPrice} - \text{Budget}}{\text{Budget}}\right) & \text{if PlanPrice} > \text{Budget} \end{cases}$$

*Rationale*: Plans under budget receive high scores ($0.90$ to $1.00$). Plans over budget decay smoothly at $1.5\times$ overspend ratio.

#### E. Roaming Match ($\text{roamingMatch}$)
$$\text{roamingMatch} = \begin{cases} 1.0 & \text{if roamingRequired} = \text{true and plan.roamingIncluded} = \text{true} \\ 0.1 & \text{if roamingRequired} = \text{true and plan.roamingIncluded} = \text{false} \\ 0.8 & \text{if roamingRequired} = \text{false} \end{cases}$$

---

### 2. Total Weighted Score Formula

$$\text{Total Score} = w_{\text{data}} \cdot \text{dataFit} + w_{\text{calls}} \cdot \text{callFit} + w_{\text{sms}} \cdot \text{smsFit} + w_{\text{budget}} \cdot \text{budgetFit} + w_{\text{roaming}} \cdot \text{roamingMatch}$$

Where default weights sum to $1.00$:
- $w_{\text{data}} = 0.30$ ($30\%$)
- $w_{\text{calls}} = 0.20$ ($20\%$)
- $w_{\text{sms}} = 0.15$ ($15\%$)
- $w_{\text{budget}} = 0.20$ ($20\%$)
- $w_{\text{roaming}} = 0.15$ ($15\%$)

---

## 📂 4. Comprehensive File-by-File Guide

Below is an exhaustive explanation of every file and folder in `server/`.

```text
server/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   ├── db.js
│   │   └── swagger.js
│   ├── models/
│   │   ├── Customer.js
│   │   ├── Plan.js
│   │   └── Recommendation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── plans.js
│   │   └── recommendations.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── planController.js
│   │   └── recommendationController.js
│   ├── services/
│   │   └── recommendationEngine.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   └── utils/
│       └── errors.js
├── tests/
│   ├── recommendationEngine.test.js
│   ├── customers.test.js
│   ├── plans.test.js
│   ├── recommendations.test.js
│   └── auth.test.js
├── scripts/
│   ├── seed.js
│   ├── seedAdmin.js
│   └── importCustomers.js
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

### 🚀 4.1 Application Setup Files

#### `src/server.js`
- **Purpose**: Server entry point that initializes HTTP server listening on `process.env.PORT`.
- **Key Logic**: Calls `connectDB()` to connect to MongoDB Atlas before launching `server.listen()`. Exports `{ server, app }` for automated testing.

#### `src/app.js`
- **Purpose**: Main Express application assembly module.
- **Key Logic**: Configures security middleware (`helmet`, `cors`), request loggers (`morgan`), body parsers (`express.json`), global rate limiting (`defaultLimiter`), mounts API routers, attaches Swagger UI (`/api-docs`), and defines 404 & global error handling middleware.

---

### ⚙️ 4.2 Configuration Modules (`src/config/`)

#### `src/config/env.js`
- **Purpose**: Loads environment variables from `.env` using `dotenv`.
- **Key Logic**: Exports centralized `env` object containing defaults for `PORT`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CLIENT_URL`, and `NODE_ENV`.

#### `src/config/db.js`
- **Purpose**: Manages Mongoose connection lifecycle to MongoDB Atlas.
- **Key Logic**: Executes `mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })`. Logs connection success and handles network errors cleanly.

#### `src/config/swagger.js`
- **Purpose**: Sets up OpenAPI 3.0 API documentation using `swagger-jsdoc` and `swagger-ui-express`.
- **Key Logic**: Defines schemas and endpoint documentation for `/api/health`, `/api/auth/login`, `/api/customers`, `/api/plans`, and `/api/recommendations`. Served interactively at `http://localhost:5000/api-docs`.

---

### 🗄 4.3 Database Models (`src/models/`)

#### `src/models/Customer.js`
- **Purpose**: Defines schema and index rules for customer telemetry and profile data.
- **Fields**:
  - `name`: Required String.
  - `phone`: Required String (indexed for fast query lookup).
  - `tenureMonths`: Number >= 0.
  - `contractType`: Enum (`'prepaid'`, `'postpaid'`).
  - `usage`: Object containing `avgCallMin`, `dataGB`, `smsCount`, `dayEveningNightSplit`, `roamingUsage`, `internationalUsage`.
  - `currentPlanId`: Ref to `Plan` model (nullable).

#### `src/models/Plan.js`
- **Purpose**: Defines schema for tariff plan catalogue.
- **Fields**:
  - `planName`: Required String.
  - `price`: Number >= 0 (indexed for price range queries).
  - `dataGB`: Number >= 0.
  - `callMinutes`: Number >= 0.
  - `sms`: Number >= 0.
  - `roamingIncluded`: Boolean (indexed).
  - `validityDays`: Number > 0 (default 28).
  - `sourceOperatorRef`: String.

#### `src/models/Recommendation.js`
- **Purpose**: Audit collection schema for tracking generated recommendations.
- **Fields**:
  - `customerId`: Ref to `Customer` (nullable for anonymous profile recommendations, indexed).
  - `sessionId`: String (indexed for chatbot session integration).
  - `recommendedPlans`: Array of `{ planId, score, explanation }`.
  - `source`: Enum (`'customer'`, `'profile'`, `'chat_profile'`).
  - `generatedAt`: Date (indexed).

---

### 🛣 4.4 API Routes (`src/routes/`)

#### `src/routes/auth.js`
- **Purpose**: Authentication endpoints.
- **Endpoints**: `POST /api/auth/login` -> `authController.login`.

#### `src/routes/customers.js`
- **Purpose**: Customer lookup endpoints.
- **Endpoints**:
  - `GET /api/customers/:id` -> `customerController.getCustomerById`
  - `GET /api/customers/:id/usage` -> `customerController.getCustomerUsage`

#### `src/routes/plans.js`
- **Purpose**: Plan catalogue endpoints.
- **Endpoints**:
  - `GET /api/plans` (Public) -> `planController.getAllPlans`
  - `POST /api/plans` (Admin Protected) -> `authenticateJWT` -> `planController.createPlan`
  - `PUT /api/plans/:id` (Admin Protected) -> `authenticateJWT` -> `planController.updatePlan`
  - `DELETE /api/plans/:id` (Admin Protected) -> `authenticateJWT` -> `planController.deletePlan`

#### `src/routes/recommendations.js`
- **Purpose**: Recommendation scoring endpoints guarded by `recommendationLimiter`.
- **Endpoints**:
  - `POST /api/recommendations/by-customer/:id` -> `recommendationController.recommendByCustomer`
  - `POST /api/recommendations/by-profile` -> `recommendationController.recommendByProfile`

---

### 🎮 4.5 Controllers (`src/controllers/`)

#### `src/controllers/authController.js`
- **Purpose**: Handles admin login authentication.
- **Logic**: Compares incoming username and password against `ADMIN_USERNAME` and `ADMIN_PASSWORD` (using `bcrypt.compare` if hashed). On success, signs a 24-hour JWT token containing `{ username, role: 'admin' }`.

#### `src/controllers/customerController.js`
- **Purpose**: Fetches customer profiles and usage telemetry.
- **Logic**: Validates MongoDB ObjectId format using `mongoose.Types.ObjectId.isValid()`. Returns 404 if customer does not exist; returns customer doc using `.lean()` for performance.

#### `src/controllers/planController.js`
- **Purpose**: Handles plan listing and admin CRUD operations.
- **Logic**: `getAllPlans` parses query filters (`minPrice`, `maxPrice`, `roamingIncluded`, `page`, `limit`). Admin actions (`createPlan`, `updatePlan`, `deletePlan`) mutate the `Plan` collection in MongoDB.

#### `src/controllers/recommendationController.js`
- **Purpose**: Coordinates recommendation generation and audit logging.
- **Logic**: Loads plans, passes them to `recommendationEngine`, stores audit record in `Recommendation` model, and returns Top 3 recommended plans with numeric scores.

---

### 🧮 4.6 Services (`src/services/`)

#### `src/services/recommendationEngine.js`
- **Purpose**: Core deterministic multi-factor plan recommendation engine.
- **Logic**: Exports `calculateDataFit`, `calculateCallFit`, `calculateSmsFit`, `calculateBudgetFit`, `calculateRoamingMatch`, `calculateScore`, `getTopRecommendations`, and `customerToRecommendationProfile`.
- **Properties**: 100% deterministic, zero external API key requirements, unit-testable.

---

### 🛡 4.7 Middleware (`src/middleware/`)

#### `src/middleware/auth.js`
- **Purpose**: JWT verification middleware for protected routes.
- **Logic**: Reads `Authorization: Bearer <token>`, verifies signature using `jwt.verify(token, JWT_SECRET)`, and attaches `req.user`. Rejects missing, invalid, or expired tokens with HTTP 401.

#### `src/middleware/validate.js`
- **Purpose**: Request payload validation wrapper using Zod schemas.
- **Logic**: Runs `schema.safeParse(req.body)` and forwards formatted validation errors to the error handler if parsing fails.

#### `src/middleware/rateLimiter.js`
- **Purpose**: Express rate limiting instance using `express-rate-limit`.
- **Logic**: Defines `defaultLimiter` (200 req / 15 min) and `recommendationLimiter` (30 req / 1 min). Returns HTTP 429 when exceeded.

#### `src/middleware/errorHandler.js`
- **Purpose**: Centralized error middleware catching all `next(error)` calls.
- **Logic**: Maps Mongoose `CastError` to 400 `VALIDATION_ERROR`, JWT errors to 401 `UNAUTHORIZED`, and formats output to standardized `{ error: { message, code, details } }`.

---

### 🛠 4.8 Utilities (`src/utils/`)

#### `src/utils/errors.js`
- **Purpose**: Custom error class extending standard JavaScript `Error`.
- **Logic**: Exports `AppError(message, statusCode, code, errors)` capturing stack traces.

---

### 📜 4.9 Database Scripts (`scripts/`)

#### `scripts/seed.js`
- **Purpose**: Database seeder script (`npm run seed`).
- **Logic**: Connects to MongoDB Atlas, clears existing collections, inserts 6 realistic tariff plans, and inserts 25 telecom customers across various usage tiers.

#### `scripts/seedAdmin.js`
- **Purpose**: Admin credentials utility (`npm run seed:admin`).
- **Logic**: Hashes admin password using `bcrypt.hash()` and prints credentials for setup.

#### `scripts/importCustomers.js`
- **Purpose**: Customer usage CSV importer (`npm run import:customers <file.csv>`).
- **Logic**: Streams CSV using `csv-parser`, maps fields, validates numbers, upserts records by phone number, and prints summary metrics (Total, Inserted, Updated, Invalid, Skipped).

---

### 🧪 4.10 Automated Test Suite (`tests/`)

- **`recommendationEngine.test.js`**: Unit tests verifying factor scoring formulas, weighted sums, edge cases (zero budget, high budget, 0/1/2/many plans).
- **`customers.test.js`**: Integration tests using `mongodb-memory-server` for customer GET endpoints and 404/validation errors.
- **`plans.test.js`**: Integration tests for GET plans and admin JWT-protected POST/PUT/DELETE plans.
- **`recommendations.test.js`**: Integration tests verifying `/by-customer/:id` and `/by-profile` output structure and audit record creation.
- **`auth.test.js`**: Integration tests for POST `/api/auth/login` (success & 401 failure).

---

### ⚙️ 4.11 Root Configuration Files

- **`package.json`**: Defines Node project metadata, start scripts (`start`, `dev`, `seed`, `import:customers`, `test`), engine requirements (`node >= 20.0.0`), and dependencies.
- **`.env.example` & `.env`**: Environment key-value configuration.
- **`Dockerfile` & `docker-compose.yml`**: Docker container configuration for Node 20 alpine and MongoDB 7.0 services.
- **`README.md`**: Project quick start documentation.

---

## 🔒 5. Security, Validation & Error Handling Architecture

### 1. Standard Error Format
All errors returned by the API follow this strict schema:
```json
{
  "error": {
    "message": "Customer not found",
    "code": "CUSTOMER_NOT_FOUND"
  }
}
```

Standard Error Codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `CUSTOMER_NOT_FOUND` (404)
- `PLAN_NOT_FOUND` (404)
- `INVALID_PROFILE` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

### 2. Security Stack
- **Password Security**: Passwords hashed with `bcryptjs` using salt rounds = 10.
- **Token Security**: Standard JWT Bearer tokens signed with `JWT_SECRET` expiring in 24 hours.
- **Rate Limiting**: Recommendation endpoints limited to 30 requests/minute per IP to prevent automated scraping or denial of service.
- **Header Protection**: `helmet()` masks Express headers and enforces security policies.

---

## 🎤 6. Top 10 Project Presentation & Viva Defense Questions (With Answers)

### Q1: What is the core objective of this system, and how is it structured?
> **Answer**: The system is designed to automate telecom tariff plan recommendations for subscribers. It takes customer usage telemetry (calls, data, SMS, roaming) or user profile preferences and matches them against a catalogue of tariff plans using a deterministic multi-factor scoring model. It is structured into a clean 3-tier architecture: Express API routes/controllers, a standalone recommendation service engine, and MongoDB Atlas database models.

---

### Q2: Why is the recommendation engine deterministic instead of calling an LLM (like GPT/Claude) directly for scoring?
> **Answer**: Using a deterministic mathematical scoring model ensures:
> 1. **Zero Hallucinations**: LLMs can hallucinate fake plans or incorrect prices; a deterministic engine calculates exact mathematical fit based on actual database values.
> 2. **Sub-millisecond Speed**: Mathematical scoring runs in under 2 milliseconds, whereas LLM API calls take 1–3 seconds.
> 3. **Cost Efficiency & Reliability**: It requires no paid external API keys and never fails due to LLM rate limits or service outages. The LLM can be appended downstream solely to format friendly text explanations.

---

### Q3: Explain the mathematical formula used for scoring plans.
> **Answer**: Each plan receives a score between $0.00$ and $1.00$ calculated as a weighted sum of 5 factors:
> $$\text{Score} = 0.30 \cdot \text{dataFit} + 0.20 \cdot \text{callFit} + 0.15 \cdot \text{smsFit} + 0.20 \cdot \text{budgetFit} + 0.15 \cdot \text{roamingMatch}$$
> Each factor compares required usage against plan allowances. For example, if a plan meets or exceeds data needs, $\text{dataFit}$ returns high scores ($0.80$–$1.00$), while oversized plans receive a mild surplus penalty to prevent pushing unnecessarily expensive plans.

---

### Q4: How does the Express request pipeline process an incoming recommendation request?
> **Answer**: 
> 1. Request hits security middleware (`helmet` headers, `cors` origin check).
> 2. Pass through `recommendationLimiter` to check IP rate limits.
> 3. JSON body is parsed by `express.json()`.
> 4. Router forwards request to `recommendationController.recommendByProfile`.
> 5. Controller queries MongoDB Atlas for active plans (`Plan.find({}).lean()`).
> 6. Service engine evaluates plans and selects Top 3.
> 7. Audit log is saved in the `Recommendation` collection in MongoDB.
> 8. HTTP 200 JSON response is returned to client.

---

### Q5: How do you handle database connections and offline development fallbacks?
> **Answer**: In `src/config/db.js`, Mongoose connects to the live MongoDB Atlas cluster specified in `MONGODB_URI`. For seed scripts, automated tests, and offline development, the code features automatic fallback to `MongoMemoryServer` (an in-memory MongoDB daemon), allowing tests and scripts to run cleanly without requiring an active internet connection or local MongoDB installation.

---

### Q6: How is authentication and security implemented for admin operations?
> **Answer**: Admin login (`POST /api/auth/login`) verifies credentials using `bcrypt.compare()` against the stored hash. Upon validation, it signs a JWT token with a 24-hour expiration. Protected admin endpoints (`POST`, `PUT`, `DELETE` on `/api/plans`) pass through `authenticateJWT` middleware, which validates the `Authorization: Bearer <token>` header before permitting modification of the plan catalogue.

---

### Q7: Why were K-Means clustering and vector search removed from the backend core?
> **Answer**: K-Means clustering required batch jobs that categorized users into static clusters, which introduced staleness and complex background workers. Vector search required external embeddings (Voyage AI) and Atlas Vector Search indexes. Replacing them with direct multi-factor scoring made recommendations real-time, deterministic, lightweight, and completely independent of third-party API dependencies.

---

### Q8: How will the future AI/LLM developer integrate their chatbot with this backend?
> **Answer**: The backend exposes a stable API contract at `POST /api/recommendations/by-profile`. The AI developer's chatbot extracts user needs from conversational chat, sends the structured JSON profile to `/api/recommendations/by-profile`, receives the Top 3 scored plans, and uses the LLM to generate natural language explanations before presenting the results to the user.

---

### Q9: How is the backend code tested, and what testing strategies were used?
> **Answer**: The project includes 25 unit and integration tests written in Jest and Supertest across 5 test suites. Unit tests (`recommendationEngine.test.js`) test mathematical factor scoring and edge cases (zero budget, 0/1/2/many plans). Integration tests (`customers.test.js`, `plans.test.js`, `recommendations.test.js`, `auth.test.js`) spin up an isolated `MongoMemoryServer` to test real HTTP endpoints, JWT auth, and database operations.

---

### Q10: How would you scale this backend to handle millions of active telecom subscribers?
> **Answer**: 
> 1. **Database Indexing**: Indexes are already established on `phone`, `price`, `roamingIncluded`, `customerId`, and `generatedAt`.
> 2. **Read Caching**: Active plans can be cached using Redis (`redis.get('active_plans')`) since plan catalogues change infrequently, reducing database reads to near-zero.
> 3. **Horizontal Scaling**: The Express application is completely stateless (JWT auth stored client-side), allowing multiple Express container instances to run behind a Load Balancer (AWS ALB / NGINX).
