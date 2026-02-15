# FundLink: Design Document (v1.0)

## 1. Executive Summary

**FundLink** is an asymmetric, AI-driven matchmaking platform designed to bridge the gap between privacy-conscious founders and signal-seeking investors. By leveraging a "Shadow Profile" mechanism and AI-driven due diligence, FundLink eliminates bias, protects intellectual property, and drastically reduces the time required for deal discovery and initial screening.

The platform operates on a **"Privacy-First, Signal-Rich"** philosophy. Founders remain anonymous until a mutual interest is established, while investors receive high-fidelity, AI-curated deal flow matched specifically to their investment thesis.

### Key Value Propositions
*   **Asymmetric Privacy**: Zero-trust architecture where identity is revealed only after mutual consent.
*   **AI Due Diligence**: Automated "Senior Analyst" agents generate comprehensive reports (SWOT, Risk, Thesis) in seconds.
*   **Secure Negotiation**: Integrated "Clean Room" for document sharing and communication without data leakage.

---

## 2. System Architecture

The FundLink architecture is designed for security, scalability, and modularity. It employs a modern Single Page Application (SPA) frontend coupled with a robust Node.js/Express backend, integrated with advanced AI services.

### 2.1 High-Level Architecture Diagram

```mermaid
graph TD
    subgraph "Client Layer (Browser)"
        SPA[Single Page Application]
        Auth_Client[Auth Module]
        AI_Client[AI Client Module]
        SPA --> Auth_Client
        SPA --> AI_Client
    end

    subgraph "API Gateway & Logic"
        LB[Load Balancer / Gateway]
        API[Node.js Express Server]
        Middleware[Security & Validation Middleware]
        
        LB --> API
        API --> Middleware
        Middleware --> Controllers
    end

    subgraph "Data Persistence Layer"
        PG[(PostgreSQL - User Data)]
        VectorDB[(Pinecone - Embeddings)]
        Vault[(Secure Doc Storage)]
        
        Controllers --> PG
        Controllers --> VectorDB
        Controllers --> Vault
    end

    subgraph "AI Engine Layer"
        Orchestrator[AI Controller]
        LLM_Adapter[LLM Adapter (OpenAI/Gemini)]
        Analyst[Senior Analyst Agent]
        
        Controllers --> Orchestrator
        Orchestrator --> LLM_Adapter
        LLM_Adapter --> Analyst
    end

    Client Layer (Browser) -->|HTTPS / JSON| API Gateway & Logic
```

### 2.2 Component Descriptions

#### **Frontend (SPA)**
*   **Technology**: HTML5, Vanilla JavaScript (ES6 Modules), Tailwind CSS.
*   **Core Modules**:
    *   `main.js`: Central router and application bootstrapper.
    *   `Auth.js`: Handles Role-Based Access Control (RBAC) and user session management.
    *   `AIClient.js`: Manages communication with the AI backend, handling retries, timeouts, and error resilience.
*   **Design Pattern**: Module-based architecture with dynamic DOM manipulation for a reactive user experience without heavy framework overhead.

#### **Backend (API)**
*   **Technology**: Node.js, Express.js.
*   **Key Responsibilities**:
    *   **API Gateway**: Routes requests to appropriate controllers.
    *   **Middleware Chain**: Implements security headers (`Helmet`), CORS, Rate Limiting, and Input Validation.
    *   **Business Logic**: Handles user management, connection workflows, and orchestration of AI services.

#### **AI Engine**
*   **Role**: The "Brain" of the platform.
*   **Capabilities**:
    *   **Readiness Scoring**: Evaluates pitch decks against industry benchmarks.
    *   **Matchmaking**: Calculates compatibility scores between Founder profiles and Investor theses.
    *   **Report Generation**: Creates detailed investment memos and due diligence reports.
*   **Integration**: Supports multiple providers (OpenAI, Gemini) with a robust fallback to a "Demo Mode" for testing and development.

#### **Database**
*   **PostgreSQL**: Relational data for Users, Profiles, Connections, and Messages.
*   **Pinecone (Vector DB)**: Stores semantic embeddings of pitch decks and investment theses for high-dimensional matching (Planned).
*   **Secure Vault**: Encrypted object storage for sensitive documents (Pitch Decks, Financials).

---

## 3. Data Design

### 3.1 Data Flow: The Matchmaking Loop

1.  **Ingestion**: Founder uploads pitch deck -> System encrypts and stores in Vault -> Generates Vector Embeddings.
2.  **Matching**: Investor defines Thesis -> System queries Vector DB -> Returns ranked "Shadow Profiles".
3.  **Connection**: Investor requests access -> Founder receives notification -> Founder approves -> Identity unlocked.

### 3.2 Schema Overview

#### **User Entity**
*   `id`: UUID
*   `role`: ENUM ('FOUNDER', 'INVESTOR')
*   `email`: String (Unique)
*   `password_hash`: String (Argon2)
*   `verified`: Boolean

#### **Founder Profile**
*   `user_id`: UUID (Foreign Key)
*   `startup_name`: String
*   `sector`: String
*   `stage`: ENUM ('Pre-Seed', 'Seed', 'Series A')
*   `ask_amount`: Number
*   `readiness_score`: Integer (0-100)
*   `pitch_deck_url`: String (Encrypted Path)

#### **Investor Profile**
*   `user_id`: UUID (Foreign Key)
*   `firm_name`: String
*   `thesis_vectors`: JSON (Embeddings)
*   `check_size_min`: Number
*   `check_size_max`: Number

#### **Connection**
*   `id`: UUID
*   `founder_id`: UUID
*   `investor_id`: UUID
*   `status`: ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'ARCHIVED')
*   `created_at`: Timestamp
*   `unlocked_at`: Timestamp

---

## 4. API Design

The API follows strict RESTful principles, consuming and producing JSON.

### 4.1 Endpoints Structure

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | User registration | Public |
| **POST** | `/api/auth/login` | User authentication | Public |
| **POST** | `/api/ai/analyze` | Analyze pitch deck and generate score | Founder |
| **POST** | `/api/ai/match` | Calculate match score between entities | System/Investor |
| **POST** | `/api/ai/report` | Generate deep-dive due diligence report | Investor |
| **GET** | `/api/user/profile` | Fetch current user profile | Authenticated |
| **POST** | `/api/connections/request` | Initiate connection request | Investor |
| **PUT** | `/api/connections/approve` | Approve connection request | Founder |

### 4.2 Security & Validation
*   **Authentication**: JWT (JSON Web Tokens) in HttpOnly cookies.
*   **Rate Limiting**: Redis-backed sliding window limiter (e.g., 20 req/min for AI endpoints).
*   **Input Validation**: Strict schema validation (Zod or Joi) on all ingress points.

---

## 5. UI/UX Design

### 5.1 Design System
*   **Framework**: Tailwind CSS.
*   **Typography**: Inter (sans-serif) for clean, modern readability.
*   **Color Palette**:
    *   **Primary**: Deep Blue (`#0f172a`) - Trust, stability.
    *   **Secondary**: Emerald Green (`#10b981`) - Growth, success, capital.
    *   **Accent**: Amber (`#f59e0b`) - Opportunity, action.
    *   **Background**: Slate (`#f8fafc`) - Neutral, clean workspace.

### 5.2 User Flows
*   **Founder Flow**: Upload Deck -> View Score -> Optimize -> Wait for Requests -> Approve -> Negotiate.
*   **Investor Flow**: Define Thesis -> Browse Shadow Feed -> Analyze (AI) -> Request Access -> Due Diligence -> Term Sheet.

### 5.3 Accessibility
*   **WCAG 2.1 AA** compliance target.
*   Semantic HTML5 elements.
*   High contrast ratios for text.
*   Keyboard navigability for all interactive elements.

---

## 6. Security Design

FundLink operates in a high-stakes financial domain, making security paramount.

### 6.1 Authentication & Authorization
*   **RBAC**: Strict separation of duties. API endpoints verify roles before execution.
*   **Session Management**: Short-lived JWTs with refresh token rotation.

### 6.2 Data Protection
*   **Encryption at Rest**: AES-256 for all database entries and stored documents.
*   **Encryption in Transit**: TLS 1.3 for all communications.
*   **PII Masking**: "Shadow Profiles" are generated by stripping PII (Personally Identifiable Information) from the dataset before it hits the Investor Feed.

### 6.3 Compliance
*   **GDPR / DPDP (India)**: "Right to be Forgotten" implemented. User data is isolated and exportable.
*   **SEBI Regulations**: Platform acts as a "Discovery Layer" only, not a profound interface, ensuring compliance with AIF regulations.

---

## 7. Scalability & Future Roadmap

### 7.1 Infrastructure Scaling
*   **Vertical**: Optimized Node.js runtime.
*   **Horizontal**: Stateless API design allows for auto-scaling groups behind a Load Balancer.
*   **Caching**: Redis layer for caching AI response computation and user sessions.

### 7.2 Roadmap
*   **Phase 2 (Automation)**: Automated term sheet generation based on negotiated parameters.
*   **Phase 3 (Ecosystem)**: Integration with legal and banking APIs for seamless deal closure.
*   **Phase 4 (Market Network)**: "Talent Pipeline" allowing funded startups to hire directly from a vetted candidate pool.
