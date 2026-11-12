# NeedBridge AI 🌉
### *AI-Powered Community Aid Matching & Transparent Payment Platform*
**Hackathon Showcase — Full-Stack Architecture (Phase 1 Frontend + Phase 2 Backend + Phase 3 Integration + Phase 4 Gemini AI + Phase 5 PayPal Sandbox)**

---

## 🌟 Executive Overview
**NeedBridge AI** bridges the critical gap between grassroots beneficiaries facing urgent shortages (winter heating, nutritional hampers, medical kits, clean water) and generous donors who want transparent, verifiable impact.

Unlike traditional relief systems plagued by manual intake bottlenecks, supply mismatches, and opaque cash handling, NeedBridge AI introduces:
1. **Google Gemini AI Needs Triage Engine:** Uses the official Google Gen AI SDK (`@google/genai`) to evaluate crisis descriptions, classify assistance types, identify missing intake data, recommend auditor verification steps, and triage urgency.
2. **Deterministic PostgreSQL Supplies Catalogue:** Evaluates budgets strictly against verified catalogue products (Food kits, drinking water, thermal blankets, trauma kits, etc.). All pricing is computed deterministically in backend code (`unit_price * quantity`)—never trusting LLM arithmetic.
3. **Warehouse Inventory Matching:** Matches approved aid requests to available physical stock in the database, calculating fulfillable quantities, inventory shortfalls, and matched costs.
4. **PayPal Developer Sandbox Escrow Integration:** Integrates PayPal Orders REST API v2 (`POST /api/payments/create-order` and `POST /api/payments/capture-order`) with server-side validation, duplicate capture prevention, and anti-tampering guards.
5. **Cryptographically Audited Public Ledger:** Every donation, PayPal capture ID, purchase order, and allocation record is transparently recorded.
6. **Anti-Hallucination Delivery Standard:** Payment completion indicates verified funds in escrow; tangible relief supplies are never claimed as delivered until warehouse physical fulfillment is verified by human auditors.

---

## 🚀 Live Demo Quickstart

### 1. Backend Server (Express + PostgreSQL + Gemini AI + PayPal Sandbox)
```bash
# Navigate to backend and install dependencies
cd backend
npm install

# Run database migrations (001 + 002 + 003) and seed catalogue & demo accounts
npm run seed

# Start the backend server (runs on port 5000)
npm start

# Run the automated Phase 5 PayPal Sandbox verification suite (45 checks):
node ../scripts/test-phase5-paypal.js

# Run the automated Phase 4 Gemini AI verification suite (31 checks):
node ../scripts/test-phase4-ai.js
```

### 2. Frontend Application (React + Vite)
```bash
# In the project root:
npm install
npm run dev
# Open in your browser: http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎭 1-Click Interactive Hackathon Demo Modes
NeedBridge AI features an omnipresent **Hackathon Demo Persona Bar** at the top of every screen. With a single click, judges can evaluate all 3 ecosystem perspectives:

| Persona | Name | Role Capabilities |
| :--- | :--- | :--- |
| **Beneficiary** | *Elena Rostova* | Submit emergency aid requests, drag & drop intake proofs, watch real-time AI need scoring, track status pipeline. |
| **Donor** | *Dr. Jane Chen* | Browse AI-ranked needs, filter by category/urgency, pledge funds via simulated PayPal checkout, review instant receipt. |
| **Admin Auditor** | *Sarah Al-Mansoor* | Triage incoming requests, review attached intake documents, approve for donor portal or request revisions. |

*Tip:* Use the **Reset Demo Data** button (`↺`) in the top banner anytime to restore initial hackathon state.

---

## 🗺️ Complete Page Roster (All 9 Phase 1 Pages)

| # | Route | Page Title | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **1** | `/` | **Landing Page** | High-impact hero, problem vs. solution analysis, 4-step pipeline, live AI dispatch preview, impact statistics counter, and call-to-actions. |
| **2** | `/login` | **Login Portal** | Email/password validation plus **1-click Quick Demo Sign-In** for Donor, Beneficiary, and Admin roles. |
| **3** | `/register` | **Registration** | Account creation with dual role selection (Donor vs Beneficiary) and field validation. |
| **4** | `/beneficiary` | **Beneficiary Dashboard** | Community request statistics, recent claims list, live status badges, and quick "Submit Aid Request" trigger. |
| **5** | `/beneficiary/new-request` | **Submit Aid Request** | Category selection, need description, quantity & units, beneficiary count, urgency selector, document upload UI, and **real-time Gemini AI score preview**. |
| **6** | `/donor` | **Donor Discovery Portal** | Catalog of approved requests with search, category pills, urgency filter, card grid vs table view toggle, funding progress bars, and instant "Support" modal. |
| **7** | `/donor/requests/:id` | **Request Details View** | Deep dive into a single cause: Gemini AI vulnerability breakdown, itemized supply manifest, verified documents list, donor contribution timeline, and PayPal support action. |
| **8** | `/admin` | **Admin Verification Queue** | Audit incoming intake requests, inspect attached documents, inspect AI confidence flags, and execute 1-click **Approve** or **Reject** actions. |
| **9** | `/transparency` | **Transparency Ledger** | Public immutable audit trail: mock PayPal transaction IDs, wholesale purchase order references, SHA-256 block hashes, search & copy hash, and modal audit invoice view. |

---

## 📂 Project Architecture & Folder Structure

```
needbridge-ai/
├── public/
│   └── favicon / brand assets
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AiAnalysisCard.jsx    # Breakdown of Gemini AI factors (Vulnerability, Urgency, Anomaly Flags)
│   │   │   └── AiScoreBadge.jsx      # Color-coded urgency & prioritization badge
│   │   ├── common/
│   │   │   ├── Badge.jsx             # Reusable Urgency & Status badges
│   │   │   ├── DemoBanner.jsx        # Top persistent Hackathon persona switcher
│   │   │   ├── Footer.jsx            # Nonprofit branding, disclaimer, and links
│   │   │   ├── Modal.jsx             # Accessible backdrop dialog modal
│   │   │   ├── Navbar.jsx            # Navigation header with role avatar & dropdown
│   │   │   ├── ProgressBar.jsx       # Dynamic funding percentage progress bar
│   │   │   ├── Sidebar.jsx           # Role-specific collapsible workspace sidebar
│   │   │   ├── StatCard.jsx          # Metric statistic card with icons & trends
│   │   │   └── Toast.jsx             # Floating notification alert component
│   │   └── donor/
│   │       └── SupportModal.jsx      # Donation presets, PayPal sandbox simulator & receipt
│   ├── context/
│   │   ├── AuthContext.jsx           # User authentication, role persistence & demo personas
│   │   └── RequestContext.jsx        # Live state for aid requests, transactions & toasts
│   ├── data/
│   │   ├── mockCategories.js         # Standard aid categories with icons & units
│   │   ├── mockRequests.js           # Realistic humanitarian seed requests with AI metadata
│   │   └── mockTransactions.js       # Transparent ledger records with cryptographic hashes
│   ├── pages/
│   │   ├── AdminDashboard.jsx        # Audit queue & approve/reject workflows
│   │   ├── BeneficiaryDashboard.jsx  # Beneficiary tracking & request management
│   │   ├── DonorDashboard.jsx        # Donor marketplace & search/filter catalog
│   │   ├── LandingPage.jsx           # Public home with problem/solution & impact metrics
│   │   ├── LoginPage.jsx             # Authentication & 1-click demo logins
│   │   ├── RegisterPage.jsx          # User signup with role choice
│   │   ├── RequestDetailsPage.jsx    # Single need deep-dive, AI card & donor timeline
│   │   ├── SubmitAidRequestPage.jsx  # Need creation form with live AI estimator
│   │   └── TransparencyDashboard.jsx # Public on-chain ledger & receipt viewer
│   ├── utils/
│   │   ├── aiScorer.js               # Algorithmic simulation of Gemini AI need ranking
│   │   └── formatters.js             # Currency, date, percentage & hash helpers
│   ├── App.jsx                       # Application router & layout wrapping
│   ├── index.css                     # Tailwind CSS directives & custom typography
│   └── main.jsx                      # React 18 DOM root
├── index.html                        # HTML5 shell with Google Plus Jakarta Sans font
├── package.json                      # Dependencies (React 18, Vite 6, Tailwind 3, Lucide)
├── tailwind.config.js                # Custom Navy & Teal design system
└── vite.config.js                    # Vite server configuration
```

---

## 🎨 UI/UX Design System
- **Backgrounds:** Clean crisp slate/white surfaces (`#F8FAFC`, `#FFFFFF`)
- **Primary Navy:** Deep authoritative slate/navy (`#0F172A`, `#1E293B`)
- **Accent Teal:** Trustworthy humanitarian teal (`#0D9488`, `#14B8A6`, `#F0FDFA`)
- **Alert Colors:** Emerald (`#10B981`) for verification, Amber (`#F59E0B`) for medium urgency, Rose (`#F43F5E`) for critical 24-48h life-safety needs.
- **Typography:** `Plus Jakarta Sans` for clean body & headings; `JetBrains Mono` for cryptographic hashes, receipts, and IDs.

---

## 🔮 Phase 2 Roadmap & API Integration Points
1. **Google Gemini API:** Replace client-side `aiScorer.js` with live Gemini 1.5 Pro multimodal processing to inspect uploaded images (e.g. disaster damage photos, handwritten clinic receipts) and extract structured item manifests.
2. **PayPal Developer Gateway:** Connect live PayPal JavaScript SDK sandbox buttons to authorize real payment holds in escrow, triggered upon wholesale delivery confirmation.
3. **Database & Auth:** Supabase / PostgreSQL backend for real-time WebSockets and SMS alerts to community coordinators.

