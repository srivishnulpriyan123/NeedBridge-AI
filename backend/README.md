# NeedBridge AI — Backend REST API & PostgreSQL Architecture

Welcome to the backend service for **NeedBridge AI – An AI-Powered Community Aid Matching and Transparent Payment Platform** (Phase 2).

---

## 🏗️ Architecture & Technology Stack

- **Runtime:** Node.js (v18+ / v20+ / v22+)
- **Web Framework:** Express.js 4 (ES Modules)
- **Database:** PostgreSQL (with connection pooling via `pg`)
- **Authentication:** JWT (`jsonwebtoken`) & password hashing with `bcryptjs`
- **Validation:** `express-validator` middleware
- **Security:** `cors` configured for local frontend development origins

```
backend/
├── config/
│   └── db.js                        # PostgreSQL connection pool & health diagnostics
├── controllers/
│   ├── authController.js            # Register, Login, and Profile metrics
│   ├── requestController.js         # Aid request CRUD, filtering & Admin approval
│   └── donationController.js        # Transparent donations & aggregate volume
├── middleware/
│   ├── authMiddleware.js            # JWT verification & Role-Based Access Control (RBAC)
│   └── errorMiddleware.js           # 404 handler & centralized error handler
├── migrations/
│   └── 001_create_tables.sql        # Database schema, foreign keys, indexes & triggers
├── routes/
│   ├── authRoutes.js                # Auth endpoints
│   ├── requestRoutes.js             # Aid request endpoints
│   └── donationRoutes.js            # Donation endpoints
├── seed/
│   └── seed.js                      # Automated migration & seed population script
├── .env.example                     # Environment template
├── .gitignore                       # Git exclusions (node_modules, .env, pgdata)
├── package.json                     # Dependencies and run scripts
├── server.js                        # Express server entry point & CORS setup
└── test-api.js                      # Automated 36-point test suite
```

---

## 🗄️ Database Schema (`needbridge_db`)

### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique user identifier |
| `name` | `VARCHAR(150)` | `NOT NULL` | Full or organization name |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Login email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed password |
| `role` | `VARCHAR(20)` | `CHECK IN ('beneficiary', 'donor', 'admin')` | User role |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registration timestamp |

### 2. `aid_requests`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique request identifier |
| `beneficiary_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | Creator of the request |
| `title` | `VARCHAR(255)` | `NOT NULL` | Request headline |
| `description` | `TEXT` | `NOT NULL` | Detailed relief context |
| `category` | `VARCHAR(100)` | `NOT NULL` | Aid category (Food, Medical, Shelter, etc.) |
| `quantity` | `VARCHAR(100)` | `NOT NULL` | Supply quantity & units |
| `beneficiaries_count` | `INTEGER` | `CHECK > 0` | Number of affected people |
| `location` | `VARCHAR(255)` | `NOT NULL` | Community ward / shelter site |
| `urgency` | `VARCHAR(20)` | `CHECK IN ('low', 'medium', 'high', 'critical')` | Need urgency tier |
| `status` | `VARCHAR(20)` | `CHECK IN ('pending', 'approved', 'rejected', 'fulfilled')` | Review status |
| `estimated_budget` | `NUMERIC(12, 2)`| `DEFAULT 0.00` | Target funding in USD |
| `funds_raised` | `NUMERIC(12, 2)`| `DEFAULT 0.00` | Amount funded in USD |
| `admin_notes` | `TEXT` | `NULLABLE` | Auditor justification / review note |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Auto-updated on modification |

### 3. `donations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Unique donation record identifier |
| `donor_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | Donor contributor |
| `request_id` | `INTEGER` | `REFERENCES aid_requests(id) ON DELETE CASCADE` | Funded aid request |
| `amount` | `NUMERIC(12, 2)`| `CHECK > 0` | Contributed dollar amount |
| `payment_status` | `VARCHAR(20)` | `CHECK IN ('pending', 'completed', 'failed')` | Settlement status |
| `payment_provider` | `VARCHAR(100)`| `DEFAULT 'paypal_mock_sandbox'` | Payment channel |
| `paypal_order_id` | `VARCHAR(150)`| `NULLABLE` | Gateway order reference |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Transaction timestamp |

### 4. `supplies_catalogue` (Migration 002)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Product identifier |
| `product_name` | `VARCHAR(150)` | `NOT NULL` | Relief item name |
| `category` | `VARCHAR(100)` | `NOT NULL` | Item category |
| `description` | `TEXT` | `NULLABLE` | Specifications |
| `unit_price` | `NUMERIC(10, 2)`| `NOT NULL, CHECK >= 0` | Verified catalogue unit rate |
| `unit` | `VARCHAR(50)` | `DEFAULT 'kit'` | Measurement unit |
| `available_quantity`| `INTEGER` | `NOT NULL, CHECK >= 0`| Live stock count |
| `availability_status`| `VARCHAR(20)`| `available / low_stock / out_of_stock` | Status |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Entry timestamp |

### 5. `ai_analyses` (Migration 002)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Audit analysis record ID |
| `request_id` | `INTEGER` | `REFERENCES aid_requests(id) ON DELETE CASCADE` | Analyzed request |
| `model_name` | `VARCHAR(100)` | `NOT NULL` | Gemini model / engine used |
| `analysis_result`| `JSONB` | `NOT NULL` | Structured triage, budget, & recommendations |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Analysis timestamp |

---

## 🔑 Demo Seed Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | *Sarah Al-Mansoor* | `admin@needbridge.ai` | `AdminPass123!` |
| **Beneficiary** | *Elena Rostova* | `elena@communityaid.org` | `BeneficiaryPass123!` |
| **Beneficiary** | *Marcus Vance* | `marcus@riverside.org` | `BeneficiaryPass123!` |
| **Donor** | *Dr. Jane Chen* | `dr.jane@healthtrust.org` | `DonorPass123!` |
| **Donor** | *Sarah Jenkins* | `sarah.j@greenleaf.org` | `DonorPass123!` |

---

## ⚙️ Environment Variables (`.env`)

```ini
PORT=5000
NODE_ENV=development

# PostgreSQL Connection Parameters
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=needbridge_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret Configuration
JWT_SECRET=needbridge_jwt_super_secret_development_key_2026!
JWT_EXPIRES_IN=7d

# CORS Allowed Origins
CLIENT_URL=http://localhost:3000,http://localhost:3001
```

---

## 🚀 Setup & Execution Guide (Windows)

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Run Database Migrations & Seed Sample Data
```powershell
npm run seed
# or: node seed/seed.js
```

### 3. Start the Express Server
```powershell
# Development with auto-reload:
npm run dev

# Production / Standard:
npm start
```
The server will start on `http://localhost:5000`.

### 4. Run Automated End-to-End API Test Suite
```powershell
node test-api.js
```
*(Executes 36 automated checks verifying auth, RBAC permissions, status transitions, and ledger recording).*

---

## 📡 REST API Endpoints Specification

### 1. System Health
- `GET /api/health` — Public endpoint returning server health, uptime, and PostgreSQL live connection status.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` — Authenticate user with email and password; returns JWT token.
- `GET /api/auth/profile` — Protected endpoint (Bearer JWT) returning user profile and role-specific metrics.

### 3. Aid Requests (`/api/requests`)
- `GET /api/requests` — Public/Donor catalog (defaults to approved). Supports `category`, `urgency`, `status`, `search`, and pagination.
- `GET /api/requests/:id` — Single request details with joined beneficiary info and donor contributions.
- `POST /api/requests` — Beneficiary only (Bearer JWT). Submits new aid request with status `pending`.
- `GET /api/requests/my-requests` — Beneficiary only. Returns all requests submitted by the logged-in beneficiary.
- `PUT /api/requests/:id` — Beneficiary (if pending) or Admin. Updates request details.
- `PATCH /api/requests/:id/status` — Admin only. Updates status (`approved` / `rejected`) with auditor notes.

### 4. Transparent Donations (`/api/donations`)
- `POST /api/donations` — Donor only (Bearer JWT). Pledges funds to an approved request; automatically updates request `funds_raised` and sets `status = 'fulfilled'` when goal is reached.
- `GET /api/donations` — Public transparency ledger of all contributions with summary volume.
- `GET /api/donations/my-donations` — Donor only. Returns personal donation history.

### 5. Gemini AI & Verified Supplies Catalogue (`/api/ai`)
- `GET /api/ai/catalogue` — Public endpoint returning verified supplies from PostgreSQL with unit rates and availability.
- `POST /api/ai/analyze-request/:id` — Beneficiary owner or Admin. Analyzes request description using Google Gemini API (`@google/genai`), identifies main problem, urgency, priority reason, missing information, and calculates deterministic budget using catalogue prices (`unit_price * quantity`). Saves full results to `ai_analyses` table.
- `GET /api/ai/analysis/:requestId` — Returns latest stored AI analysis for an aid request.
- `POST /api/ai/match-request/:id` — Donor or Admin. Matches an approved aid request to warehouse inventory in `supplies_catalogue`, calculating fulfilled quantities, shortfalls, and estimated matched costs.

### 6. PayPal Developer Sandbox Payments (`/api/payments`)
- `GET /api/payments/config` — Public endpoint returning safe client configuration (`clientId`, `currency`, `isSandbox`). Never exposes client secret.
- `POST /api/payments/create-order` — Donor only (Bearer JWT). Validates request existence, checks that request is approved, validates amount on backend, creates PayPal Sandbox order via Orders REST API v2, and saves a `pending` donation record in PostgreSQL.
- `POST /api/payments/capture-order` — Donor only (Bearer JWT). Captures payment using PayPal REST API, verifies capture status (`COMPLETED`), validates that captured amount matches expected amount, updates donation status to `completed` with `paypal_capture_id`, and increments target request `funds_raised` (setting `status = 'fulfilled'` when target is met). Safe against duplicate captures and replay attacks.
- `POST /api/payments/cancel-order` — Donor only. Marks pending donation order as `cancelled` if buyer exits checkout.
- `POST /api/payments/webhook` — PayPal Webhook event receiver for idempotent settlement updates.

