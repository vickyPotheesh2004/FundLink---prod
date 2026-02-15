
# FundLink Technical Requirements

## 1. Core Stack
*   **Runtime**: Node.js v16+ (Recommended: v18 LTS)
*   **Package Manager**: npm v8+ or yarn v1.22+
*   **Frontend**:
    *   HTML5 (Semantic Web Standards)
    *   CSS3 (Tailwind CSS v3.x)
    *   JavaScript (ES6+ Modules)
*   **Backend**:
    *   Node.js with Express.js
    *   Environment handling: `dotenv`
    *   Security: `helmet`, `cors`, `rate-limit`
*   **AI Integration**:
    *   OpenAI API (GPT-4)
    *   Google Gemini API (1.5 Flash/Pro)
    *   Simulation Mode (for development/testing)

## 2. Module Dependencies

### Core Modules
| Module | Purpose | Dependencies |
| :--- | :--- | :--- |
| `js/main.js` | Application bootstrap & routing | All page modules |
| `js/modules/auth.js` | Authentication & RBAC | None |
| `js/modules/AIClient.js` | AI API Client (OpenAI/Gemini/Demo) | None |
| `js/modules/renderStatic.js` | Static HTML loader | None |

### Backend Modules
| Module | Purpose |
| :--- | :--- |
| `backend/server.js` | API Gateway & Middleware |
| `backend/controllers/aiController.js` | AI Request Handling & Rate Limiting |
| `backend/ai/matchScore.js` | Matchmaking Algorithm |

### Page Modules
| Module | Purpose | Route |
| :--- | :--- | :--- |
| `js/pages/founderDashboard.js` | Founder operations | `#founder-dashboard` |
| `js/pages/investorFeed.js` | Investor deal flow | `#investor-feed` |
| `js/pages/workspace.js` | Secure negotiation | `#workspace` |
| `js/pages/acceptedWorkspace.js` | Connection management | `#accepted-workspace` |

## 3. Infrastructure (Target Production)
*   **Application Server**: Node.js (Express) on Cloud Run / Vercel
*   **Database**: PostgreSQL 14+ (Users, Connections, Messages)
*   **Vector Database**: Pinecone / Milvus (Embeddings for matchmaking)
*   **Object Storage**: AWS S3 / GCS (Secure Vault for Pitch Decks)
*   **Caching**: Redis (Rate Limiting, Session Management)

## 4. Environment Variables (`.env`)

The application requires the following environment variables for proper operation:

```ini
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000

# AI Provider Configuration ('demo', 'openai', 'gemini')
AI_PROVIDER=demo
AI_RATE_LIMIT=20

# OpenAI (If AI_PROVIDER=openai)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Gemini (If AI_PROVIDER=gemini)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash
```

## 5. Security Requirements
*   **Authentication**: JWT-based stateless authentication (replacing localStorage).
*   **Authorization**: Role-Based Access Control (RBAC) enforced at API Gateway.
*   **Data Protection**:
    *   TLS 1.3 encryption in transit.
    *   AES-256 encryption at rest for sensitive vault data.
*   **API Security**:
    *   Rate Limiting (Token Bucket / Sliding Window).
    *   CORS configuration.
    *   Input Validation (Sanitization) on all endpoints.

## 6. API Requirements
The backend must expose the following RESTful endpoints (see `DESIGN.md` for full spec):

*   `POST /api/auth/*` - Authentication & Registration
*   `POST /api/ai/analyze` - Pitch Deck Analysis
*   `POST /api/ai/match` - Compatibility Scoring
*   `POST /api/ai/report` - Due Diligence Reporting
*   `GET /api/user/profile` - User Profile Management
*   `POST /api/connections/*` - Connection Lifecycle

## 7. Storage Keys (Local Storage - Deprecated/Dev Only)
*Note: Production updates will migrate these to PostgreSQL.*

| Key | Purpose |
| :--- | :--- |
| `fundlink_role` | Current user role |
| `fundlink_user_profiles` | Mock database for user profiles |
| `fundlink_connection_requests` | Mock database for connections |
